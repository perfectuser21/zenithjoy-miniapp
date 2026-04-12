// 云函数：addAdmin — 将指定 OpenID 添加到 admins 集合（运维工具）
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 仅已有管理员可调用此函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const callerOpenId = wxContext.OPENID
  const { targetOpenId } = event

  if (!targetOpenId) {
    return { success: false, error: 'targetOpenId 不能为空' }
  }

  // 验证调用者是否为管理员
  const callerCheck = await db.collection('admins').where({ openId: callerOpenId }).count()
  if (callerCheck.total === 0) {
    return { success: false, error: '无权限：仅管理员可添加新管理员' }
  }

  // 检查是否已存在
  const existCheck = await db.collection('admins').where({ openId: targetOpenId }).count()
  if (existCheck.total > 0) {
    return { success: true, message: '该 OpenID 已是管理员', existed: true }
  }

  // 写入
  await db.collection('admins').add({
    data: {
      openId: targetOpenId,
      addedBy: callerOpenId,
      createdAt: db.serverDate()
    }
  })

  return { success: true, message: `已添加管理员: ${targetOpenId}` }
}
