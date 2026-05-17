Page({
  data: {
    statusBarHeight: 20,
    eyebrow: 'CREATE STUDIO',
    pageTitle: '今天创作什么',
    availablePoints: '可用积分 128',
    heroCard: {
      kicker: 'WORKFLOW OVERVIEW',
      title: '三条正式创作流程',
      description: '从创作、标题到朋友圈文案，按流程推进并直接进入执行。',
      image: '/images/studio-banner.png'
    },
    sections: [
      {
        title: '自媒体创作区域',
        meta: '按流程执行',
        tone: 'create',
        steps: ['关键词', '灵感', '知识库', '选题'],
        outcome: '梳理创作方向，得到可执行选题与内容框架',
        cta: '进入创作流程',
        action: 'copywriter'
      },
      {
        title: '标题创作区域',
        meta: '根据当前选题',
        tone: 'title',
        steps: ['确定选题', '生成标题', '筛选优化'],
        outcome: '快速得到一组可直接测试的标题方向',
        cta: '进入标题创作',
        action: 'title'
      },
      {
        title: '朋友圈文案区域',
        meta: '根据需求生成',
        tone: 'moments',
        steps: ['明确需求', '生成文案', '继续精修'],
        outcome: '输出可发布的朋友圈文案，并保留后续优化空间',
        cta: '进入朋友圈文案',
        action: 'moments'
      }
    ]
  },

  onLoad() {
    try {
      const systemInfo = wx.getSystemInfoSync()
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight || 20
      })
    } catch (e) {
      console.error('获取系统信息失败', e)
    }
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar && tabBar.setData) {
      tabBar.setData({ hidden: false, selected: 1 })
      if (typeof tabBar.updateSelected === 'function') {
        tabBar.updateSelected('/pages/ai-features/index')
      }
    }
  },

  openCopywriterStart() {
    wx.navigateTo({
      url: '/pages/copywriter/start/start'
    })
  },

  openCopywriterFlow() {
    this.openCopywriterStart()
  },

  openSection(event) {
    const { target } = event.currentTarget.dataset
    if (target === 'title') {
      this.openTitleStudio()
      return
    }
    if (target === 'moments') {
      this.openMomentsStudio()
      return
    }
    this.openCopywriterStart()
  },

  openTitleStudio() {
    wx.navigateTo({
      url: '/pages/copywriter/title-generate/title-generate'
    })
  },

  openMomentsStudio() {
    wx.navigateTo({
      url: '/pages/copywriter/moments-generate/moments-generate'
    })
  }
})
