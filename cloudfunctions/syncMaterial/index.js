// syncMaterial 云函数 — 把微信云存储里的文件搬进 ZenithJoy 的素材池
//
// ── 为什么要中转一道 ────────────────────────────────────────────────────
// 小程序 wx.uploadFile 直传 COS 需要在微信后台配「uploadFile 合法域名」，
// 而配合法域名要求域名已 ICP 备案，还得人去后台点。
// wx.cloud.uploadFile 传微信云存储不需要任何配置，云函数再从云存储搬到 COS——
// 全程不碰微信后台，客户装上就能用。
//
// ── 搬运的三步（和 iPhone 快捷指令、电脑 agent 走的是同一个协议）──────────
//   ① POST /api/materials/upload-urls  报元数据，换一个只对该对象有效的 PUT 地址
//   ② PUT 到那个地址                    文件本体进广州 COS
//   ③ POST /api/materials/complete      中台 HEAD 校验后落库
//
// 三个入口一套协议，这是刻意的：以后中台改协议，改一处三端都跟着变。
//
// ── 环境变量（与 listMaterials 共用同一套）─────────────────────────────
//   ZJ_API_BASE      中台地址
//   ZJ_UPLOAD_TOKEN  中台上传凭据

const cloud = require('wx-server-sdk')
const https = require('https')
const { URL } = require('url')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const TIMEOUT_MS = 60000

function request(method, urlString, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlString)
    const opts = {
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method: method,
      headers: headers,
      timeout: TIMEOUT_MS
    }
    const req = https.request(opts, function (res) {
      const chunks = []
      res.on('data', function (c) { chunks.push(c) })
      res.on('end', function () {
        const raw = Buffer.concat(chunks)
        let parsed = null
        try { parsed = JSON.parse(raw.toString('utf8')) } catch (e) { /* 非 JSON */ }
        resolve({ statusCode: res.statusCode, buffer: raw, json: parsed })
      })
    })
    req.on('timeout', function () { req.destroy(new Error('请求超时（' + TIMEOUT_MS + 'ms）')) })
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

function fail(code, message) {
  return { ok: false, code: code, message: message }
}

exports.main = async function (event) {
  const ev = event || {}
  const base = (process.env.ZJ_API_BASE || '').replace(/\/+$/, '')
  const token = process.env.ZJ_UPLOAD_TOKEN || ''
  if (!base || !token) {
    return fail('NOT_CONFIGURED', '云函数没配中台地址或凭据（ZJ_API_BASE / ZJ_UPLOAD_TOKEN）')
  }

  const fileID = ev.fileID
  const fileName = String(ev.fileName || '').trim()
  if (!fileID || !fileName) {
    return fail('BAD_REQUEST', '缺 fileID 或 fileName')
  }

  // ① 从微信云存储把文件读出来
  let buf
  try {
    const dl = await cloud.downloadFile({ fileID: fileID })
    buf = dl.fileContent
  } catch (err) {
    return fail('CLOUD_DOWNLOAD_FAILED', '从微信云存储读文件失败：' + err.message)
  }
  if (!buf || !buf.length) {
    return fail('EMPTY_FILE', '文件是空的，不往中台传')
  }

  const mimeType = ev.mimeType || 'application/octet-stream'
  const sizeBytes = buf.length

  // ② 换预签名 URL
  //    尾斜杠不能省：中台 nginx 的 location 带斜杠，不带会吃 301 而这里不跟随重定向
  let signRes
  try {
    signRes = await request('POST', base + '/api/materials/upload-urls/', {
      'X-Upload-Token': token,
      'Content-Type': 'application/json'
    }, JSON.stringify({
      files: [{ file_name: fileName, size_bytes: sizeBytes, mime_type: mimeType }],
      title: ev.title || null
    }))
  } catch (err) {
    return fail('UPSTREAM_UNREACHABLE', '连不上中台：' + err.message)
  }
  if (signRes.statusCode === 401 || signRes.statusCode === 403) {
    return fail('UPSTREAM_AUTH_FAILED', '中台拒绝凭据（HTTP ' + signRes.statusCode + '）')
  }
  if (signRes.statusCode !== 200 || !signRes.json || !signRes.json.success) {
    const d = signRes.json && signRes.json.error ? signRes.json.error.message : String(signRes.buffer).slice(0, 160)
    return fail('SIGN_FAILED', '换上传地址失败（HTTP ' + signRes.statusCode + '）：' + d)
  }
  const f = ((signRes.json.data || {}).files || [])[0]
  if (!f || !f.upload_url) {
    return fail('SIGN_FAILED', '中台没返回上传地址')
  }

  // ③ 文件本体 PUT 进 COS。这一步不带任何鉴权头——签名在 URL 里
  let putRes
  try {
    putRes = await request('PUT', f.upload_url, { 'Content-Length': sizeBytes }, buf)
  } catch (err) {
    return fail('COS_PUT_FAILED', '传进存储失败：' + err.message)
  }
  if (putRes.statusCode !== 200) {
    return fail('COS_PUT_FAILED', '传进存储被拒（HTTP ' + putRes.statusCode + '）')
  }

  // ④ 回调落库。中台会 HEAD 校验对象真存在且大小一致才写库
  let doneRes
  try {
    doneRes = await request('POST', base + '/api/materials/complete/', {
      'X-Upload-Token': token,
      'Content-Type': 'application/json'
    }, JSON.stringify({
      files: [{
        storage_key: f.storage_key,
        material_id: f.material_id,
        file_name: fileName,
        mime_type: mimeType,
        size_bytes: sizeBytes
      }],
      title: ev.title || null
    }))
  } catch (err) {
    // 文件已经在 COS 里了，只是没落库——如实说，别让人以为传丢了
    return fail('COMPLETE_UNREACHABLE', '文件已进存储但回调中台失败：' + err.message)
  }
  if (doneRes.statusCode !== 200 || !doneRes.json || !doneRes.json.success) {
    const d = doneRes.json && doneRes.json.error ? doneRes.json.error.message : String(doneRes.buffer).slice(0, 160)
    return fail('COMPLETE_FAILED', '落库失败（HTTP ' + doneRes.statusCode + '）：' + d)
  }

  const data = doneRes.json.data || {}
  const mat = (data.materials || [])[0] || {}
  return {
    ok: true,
    materialId: mat.id || f.material_id,
    fileName: fileName,
    sizeBytes: sizeBytes,
    // 服务端去重命中：这个文件之前传过。不是错误，要让界面能说人话
    deduped: Boolean(mat.deduped),
    contentId: data.content_id || null
  }
}
