// checkAdmin 云函数 — 校验当前用户是否为管理员
// 优先从 admins 数据库集合查询，回退到内置列表
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 内置管理员 OpenID（兜底）
const BUILTIN_ADMIN_OPENIDS = [
  'o2lLz62X0iyQEYcpnS2ljUvXlHF0',
]

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  // 从 admins 集合动态查询
  const db = cloud.database()
  let isAdmin = false

  try {
    const res = await db.collection('admins').where({ openid }).limit(1).get()
    if (res.data && res.data.length > 0) {
      isAdmin = true
    }
  } catch (e) {
    // admins 集合不存在时回退到内置列表
  }

  // 回退：内置列表 + 环境变量
  if (!isAdmin) {
    const envAdmins = process.env.ADMIN_OPENIDS
      ? process.env.ADMIN_OPENIDS.split(',').map(s => s.trim()).filter(Boolean)
      : []
    const adminOpenIds = [...new Set([...BUILTIN_ADMIN_OPENIDS, ...envAdmins])]
    isAdmin = adminOpenIds.includes(openid)
  }

  return {
    isAdmin,
    openid
  }
}
