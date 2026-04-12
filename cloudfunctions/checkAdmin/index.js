// checkAdmin 云函数 — 校验当前用户是否为管理员
// 管理员 OpenID 通过环境变量 ADMIN_OPENIDS 配置（逗号分隔多个），
// 若未配置则回退到内置列表。
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 内置管理员 OpenID（主账号）
const BUILTIN_ADMIN_OPENIDS = [
  'o2lLz62X0iyQEYcpnS2ljUvXlHF0',
]

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  // 支持通过环境变量动态扩展管理员列表（无需重新部署）
  const envAdmins = process.env.ADMIN_OPENIDS
    ? process.env.ADMIN_OPENIDS.split(',').map(s => s.trim()).filter(Boolean)
    : []

  const adminOpenIds = [...new Set([...BUILTIN_ADMIN_OPENIDS, ...envAdmins])]
  const isAdmin = adminOpenIds.includes(openid)

  return {
    isAdmin,
    openid
  }
}
