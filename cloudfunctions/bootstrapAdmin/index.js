// bootstrapAdmin 云函数 — 一次性初始化管理员（admins 集合为空时）
// 使用场景：首次部署后，在微信开发者工具中调用一次
// 安全机制：仅当 admins 集合完全为空时才允许写入，防止覆盖已有管理员
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const callerOpenid = wxContext.OPENID

  if (!callerOpenid) {
    return { success: false, error: '无法获取 OpenID，请在小程序端调用' }
  }

  // 安全检查：admins 集合必须为空才允许引导
  let total = 0
  try {
    const countResult = await db.collection('admins').count()
    total = countResult.total
  } catch (err) {
    // 集合不存在，可以继续
  }

  if (total > 0) {
    return {
      success: false,
      error: `admins 集合已有 ${total} 条记录，bootstrapAdmin 只能在集合为空时调用`,
      hint: '如需添加新管理员，请使用 addAdmin 云函数'
    }
  }

  // 写入管理员记录（调用者成为第一个管理员）
  const result = await db.collection('admins').add({
    data: {
      openId: callerOpenid,
      role: 'superadmin',
      source: 'bootstrap',
      createdAt: db.serverDate(),
      remark: '通过 bootstrapAdmin 初始化的第一个超级管理员'
    }
  })

  return {
    success: true,
    id: result._id,
    openId: callerOpenid,
    message: `管理员 ${callerOpenid} 已写入 admins 集合`
  }
}
