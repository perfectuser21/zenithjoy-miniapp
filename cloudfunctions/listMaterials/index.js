// listMaterials 云函数 — 代理到 ZenithJoy 中台，列出本租户素材
//
// ── 为什么要这个云函数，而不是小程序直连中台 ────────────────────────────
// 微信小程序的 wx.request 只能访问「已在小程序后台配置的合法域名」，而配置
// 合法域名要求该域名已 ICP 备案。中台在香港、域名后缀是 .media，备案基本无望。
// 云函数跑在腾讯云、出网不受合法域名限制，所以走它中转。
//
// ── 顺带解决的两件事 ──────────────────────────────────────────────────
// 1. 中台的上传凭据（license_key）只存在云函数的环境变量里，**小程序端永远
//    拿不到**，反编译或抓包也偷不走。
// 2. 中台以后换地址、换鉴权方式，改这个云函数即可，不用重新提审小程序。
//
// ── 需要在微信云控制台为本函数配置的环境变量 ─────────────────────────────
//   ZJ_API_BASE      中台地址，如 https://staging-autopilot.zenjoymedia.media
//   ZJ_UPLOAD_TOKEN  中台上传凭据（license_key，形如 ZJ-F-XXXXXXX）
// 没配时返回 NOT_CONFIGURED，让前端显示「未连接」而不是白屏——
// 静默失败最难查，绝不返回空列表假装「一条素材都没有」。

const cloud = require('wx-server-sdk')
const https = require('https')
const { URL } = require('url')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

/** 一页最多拿多少条。与中台的硬上限一致，传更大中台也会夹到 100。 */
const MAX_LIMIT = 100
const DEFAULT_LIMIT = 30

/** 中台响应慢时不能让小程序一直转圈。 */
const TIMEOUT_MS = 15000

function httpGetJson(urlString, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlString)
    const req = https.request(
      {
        hostname: u.hostname,
        port: u.port || 443,
        path: u.pathname + u.search,
        method: 'GET',
        headers: headers,
        timeout: TIMEOUT_MS
      },
      function (res) {
        let body = ''
        res.on('data', function (chunk) { body += chunk })
        res.on('end', function () {
          let parsed = null
          try { parsed = JSON.parse(body) } catch (e) { /* 下面按非 JSON 处理 */ }
          resolve({ statusCode: res.statusCode, body: body, json: parsed })
        })
      }
    )
    req.on('timeout', function () { req.destroy(new Error('中台响应超时（' + TIMEOUT_MS + 'ms）')) })
    req.on('error', reject)
    req.end()
  })
}

/** 把客户端传来的分页参数收成确定值。客户端传什么都当敌意输入。 */
function normalizeLimit(raw) {
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT
  return Math.min(Math.floor(n), MAX_LIMIT)
}

function normalizeOffset(raw) {
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.floor(n)
}

exports.main = async function (event) {
  const ev = event || {}
  const base = (process.env.ZJ_API_BASE || '').replace(/\/+$/, '')
  const token = process.env.ZJ_UPLOAD_TOKEN || ''

  if (!base || !token) {
    return {
      ok: false,
      code: 'NOT_CONFIGURED',
      message: '云函数还没配置中台地址或凭据（ZJ_API_BASE / ZJ_UPLOAD_TOKEN）',
      items: []
    }
  }

  const limit = normalizeLimit(ev.limit)
  const offset = normalizeOffset(ev.offset)
  const url = base + '/api/materials?limit=' + limit + '&offset=' + offset

  let res
  try {
    res = await httpGetJson(url, {
      'X-Upload-Token': token,
      Accept: 'application/json'
    })
  } catch (err) {
    // 网络故障要如实报，不能当成「没有素材」
    return {
      ok: false,
      code: 'UPSTREAM_UNREACHABLE',
      message: '连不上中台：' + err.message,
      items: []
    }
  }

  if (res.statusCode === 401 || res.statusCode === 403) {
    return {
      ok: false,
      code: 'UPSTREAM_AUTH_FAILED',
      message: '中台拒绝了凭据（HTTP ' + res.statusCode + '）。检查云函数环境变量 ZJ_UPLOAD_TOKEN。',
      items: []
    }
  }

  if (res.statusCode !== 200 || !res.json || !res.json.success) {
    const detail = res.json && res.json.error ? res.json.error.message : String(res.body).slice(0, 160)
    return {
      ok: false,
      code: 'UPSTREAM_ERROR',
      message: '中台返回异常（HTTP ' + res.statusCode + '）：' + detail,
      items: []
    }
  }

  const data = res.json.data || {}
  return {
    ok: true,
    items: Array.isArray(data.items) ? data.items : [],
    limit: data.limit,
    offset: data.offset,
    count: data.count
  }
}
