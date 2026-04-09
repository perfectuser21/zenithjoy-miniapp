// 会员中心页面
Page({
  data: {
    isLoading: true,
    userInfo: null,
    hasUserInfo: false,
    membership: null,
    membershipPlan: null,
    plans: [],
    remainingQuota: 0,
    usageToday: 0,
    usageRecords: [] // 添加使用记录数组
  },
  
  onLoad: function(options) {
    this.checkUserInfo()
    this.getMembershipPlans()
    this.checkMembership()
    this.getUsageRecords() // 获取使用记录
  },
  
  onShow: function() {
    this.checkMembership()
    this.getUsageRecords() // 刷新使用记录
  },
  
  onPullDownRefresh: function() {
    this.checkMembership()
    this.getUsageRecords()
    wx.stopPullDownRefresh()
  },
  
  // 检查用户信息
  checkUserInfo: function() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      })
    }
  },
  
  // 获取用户信息
  getUserProfile: function() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        console.log('获取用户信息成功', res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        wx.setStorageSync('userInfo', res.userInfo)
      },
      fail: (err) => {
        console.error('获取用户信息失败', err)
      }
    })
  },
  
  // 检查会员状态
  checkMembership: function() {
    this.setData({ isLoading: true })
    
    wx.cloud.callFunction({
      name: 'checkMembership',
      success: res => {
        console.log('获取会员状态成功', res.result)
        
        if (res.result.success) {
          const membershipData = res.result.data
          
          this.setData({
            membership: membershipData.membership,
            membershipPlan: membershipData.membershipPlan,
            remainingQuota: membershipData.remainingQuota,
            usageToday: membershipData.usageToday,
            isLoading: false
          })
        } else {
          this.setData({ isLoading: false })
          wx.showToast({
            title: '获取会员信息失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('调用会员检查云函数失败', err)
        this.setData({ isLoading: false })
        wx.showToast({
          title: '获取会员信息失败',
          icon: 'none'
        })
      }
    })
  },
  
  // 获取会员套餐
  getMembershipPlans: function() {
    wx.cloud.database().collection('membership_plans')
      .where({
        status: 'active'
      })
      .orderBy('price', 'asc')
      .get({
        success: res => {
          console.log('获取会员套餐成功', res.data)
          this.setData({
            plans: res.data
          })
        },
        fail: err => {
          console.error('获取会员套餐失败', err)
        }
      })
  },

  // 获取使用记录
  getUsageRecords: function() {
    wx.cloud.callFunction({
      name: 'getUsageRecords',
      success: res => {
        console.log('获取使用记录成功', res.result)
        
        if (res.result.success) {
          this.setData({
            usageRecords: res.result.data || []
          })
        } else {
          // 如果没有专门的云函数，可以从聊天记录中获取
          this.getUsageFromChats()
        }
      },
      fail: err => {
        console.error('获取使用记录失败', err)
        // 失败时也尝试从聊天记录获取
        this.getUsageFromChats()
      }
    })
  },
  
  // 从聊天记录获取使用统计
  getUsageFromChats: function() {
    const db = wx.cloud.database()
    const _ = db.command
    const $ = db.command.aggregate
    
    // 查询过去7天的记录
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    db.collection('chats')
      .where({
        // 依赖微信云数据库创建者读权限，无需显式过滤 _openid
        createTime: _.gte(sevenDaysAgo)
      })
      .orderBy('createTime', 'desc')
      .limit(100)
      .get()
      .then(res => {
        // 按日期分组统计
        const records = []
        const dateMap = {}
        
        res.data.forEach(chat => {
          const date = new Date(chat.createTime)
          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          
          if (!dateMap[dateStr]) {
            dateMap[dateStr] = 0
          }
          dateMap[dateStr]++
        })
        
        // 转换为数组
        for (const date in dateMap) {
          records.push({
            time: date,
            count: dateMap[date]
          })
        }
        
        // 按日期排序
        records.sort((a, b) => (b.time > a.time ? 1 : -1))
        
        this.setData({
          usageRecords: records
        })
      })
      .catch(err => {
        console.error('从聊天记录获取使用统计失败', err)
        // 设置默认的模拟数据
        const mockedRecords = [
          { time: this.formatDate(new Date()), count: this.data.usageToday }
        ]
        this.setData({
          usageRecords: mockedRecords
        })
      })
  },
  
  // 升级会员 — 调起微信支付
  onUpgrade: async function(e) {
    const planId = e.currentTarget.dataset.planId;
    if (!planId || planId === 'free') return;

    wx.showLoading({ title: '创建订单...' });
    try {
      const orderRes = await wx.cloud.callFunction({
        name: 'createPaymentOrder',
        data: { planId }
      });
      if (!orderRes.result?.success) {
        throw new Error(orderRes.result?.error || '创建订单失败');
      }

      const { timeStamp, nonceStr, package: pkg, signType, paySign } = orderRes.result;
      wx.hideLoading();

      wx.requestPayment({
        timeStamp,
        nonceStr,
        package: pkg,
        signType,
        paySign,
        success: () => {
          wx.showToast({ title: '支付成功', icon: 'success' });
          this.checkMembership();
        },
        fail: (err) => {
          if (err.errMsg && !err.errMsg.includes('cancel')) {
            wx.showToast({ title: '支付失败，请重试', icon: 'error' });
          }
        }
      });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '操作失败', icon: 'error' });
    }
  },

  // 格式化日期
  formatDate: function(dateString) {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },
  
  // 分享小程序
  onShareAppMessage: function() {
    return {
      title: 'AI助手-会员专享更多功能',
      path: '/pages/index/index',
      imageUrl: '/images/default-cover.png'
    }
  }
}) 