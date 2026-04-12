// checkAdmin 云函数 — 校验当前用户是否为管理员
// 优先查 admins 集合，回退到环境变量 ADMIN_OPENIDS（逗号分隔）
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 从环境变量读取兜底管理员列表（在微信云控制台配置 ADMIN_OPENIDS）
function getEnvAdmins() {
  const raw = process.env.ADMIN_OPENIDS || ''
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { isAdmin: false, openid: null }
  }

  // 优先：从 admins 集合动态查询
  try {
    const result = await db.collection('admins').where({ openId: openid }).count()
    if (result.total > 0) {
      return { isAdmin: true, openid, source: 'db' }
    }
  } catch (err) {
    // admins 集合不存在时回退，避免管理员功能完全失效
    console.warn('admins 集合查询失败，回退到环境变量:', err.message)
  }

  // 回退：环境变量 ADMIN_OPENIDS（云函数环境变量中配置）
  const envAdmins = getEnvAdmins()
  if (envAdmins.includes(openid)) {
    return { isAdmin: true, openid, source: 'env' }
  }

  return { isAdmin: false, openid }
}
