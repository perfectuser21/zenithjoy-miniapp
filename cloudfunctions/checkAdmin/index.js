// checkAdmin 云函数 — 校验当前用户是否为管理员
// 优先查 admins 集合，回退到环境变量 ADMIN_OPENIDS，最后兜底到代码内置
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 代码内置兜底：bootstrapAdmin 未调用前确保管理员功能可用
// 已在微信云控制台配置 ADMIN_OPENIDS 环境变量后此列表不再生效（env 优先级更高）
const BUILT_IN_ADMIN_OPENIDS = [
  'o2lLz62X0iyQEYcpnS2ljUvXlHF0'
]

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

  // 最终兜底：代码内置管理员列表
  if (BUILT_IN_ADMIN_OPENIDS.includes(openid)) {
    return { isAdmin: true, openid, source: 'built-in' }
  }

  return { isAdmin: false, openid }
}
