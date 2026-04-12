// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
// 管理员列表从 admins 集合动态查询，无需硬编码 OpenID
// initDatabase 云函数初始化时会将首个用户写入 admins 集合
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { isAdmin: false, openid: null }
  }

  try {
    const result = await db.collection('admins').where({
      openId: openid
    }).count()

    return {
      isAdmin: result.total > 0,
      openid: openid
    }
  } catch (err) {
    console.error('checkAdmin 查询失败', err)
    return { isAdmin: false, openid: openid, error: err.message }
  }
}
