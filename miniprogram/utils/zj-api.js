// zj-api — 小程序和 ZenithJoy 中台之间唯一的通道
//
// ── 为什么是直连，不是云函数 ──────────────────────────────────────────
// 中台域名（staging-autopilot / autopilot .zenjoymedia.media）和素材 COS 桶
// 都已经进了微信后台的「request 合法域名」，wx.request 可以直接打。
// 之前那版走微信云函数中转，是因为以为配合法域名需要备案；配上之后，中转那一跳
// 只剩坏处：多一个要部署的东西、多一个会挂的环节、还依赖云开发环境的部署权限。
//
// ── 凭据 ──────────────────────────────────────────────────────────────
// 认的是客户自己的 license key（中台的 X-Upload-Token），客户在「我的」里填一次，
// 存在自己手机上。和 iPhone 快捷指令里配自己的 key 是同一件事——三个入口一套协议。
// 绝不把某一个人的 key 写死在代码里：那样所有客户会共用一个租户。
//
// ── 上传的三步（和快捷指令、电脑 agent 走的是同一个协议）────────────────
//   ① POST /api/materials/upload-urls  报元数据，换一个只对该对象有效的 PUT 地址
//   ② PUT 到那个地址                    文件本体进广州 COS，不经过中台
//   ③ POST /api/materials/complete      中台 HEAD 校验对象真在、大小对得上，才落库

const TOKEN_KEY = 'zj_upload_token'

const BASE_PROD = 'https://autopilot.zenjoymedia.media'
const BASE_STAGING = 'https://staging-autopilot.zenjoymedia.media'

const TIMEOUT_MS = 60000
const DEFAULT_LIMIT = 60

/**
 * 只有正式版打生产，其余（开发版 / 体验版）一律 staging。
 * 写死成 staging 会让正式版客户的素材悄悄进测试库；写死成生产会让我们
 * 每次调试都动真数据。两个都不能接受，所以按 envVersion 分。
 */
function apiBase() {
  var v = 'release'
  try { v = wx.getAccountInfoSync().miniProgram.envVersion || 'release' } catch (e) { /* 兜底走生产 */ }
  return v === 'release' ? BASE_PROD : BASE_STAGING
}

function getToken() {
  try { return String(wx.getStorageSync(TOKEN_KEY) || '').trim() } catch (e) { return '' }
}

function setToken(token) {
  wx.setStorageSync(TOKEN_KEY, String(token || '').trim())
}

function clearToken() {
  wx.removeStorageSync(TOKEN_KEY)
}

function err(code, message) {
  var e = new Error(message)
  e.code = code
  e.message = message
  return e
}

/**
 * 域名没进微信后台白名单时，wx.request 报的是一句夹着一长串域名列表的话，
 * 谁看都以为是网络坏了，其实是后台少配一行。这种情况必须直接把该加的域名说出来。
 */
function describeFail(e, url) {
  var msg = (e && e.errMsg) || '未知'
  if (/域名|not in domain list|domain list/i.test(msg)) {
    var host = ''
    try { host = url.split('/')[2] } catch (x) { host = url }
    return '这个域名还没加进小程序后台的「request 合法域名」：https://' + host +
      '\n（微信公众平台 → 开发 → 开发管理 → 开发设置 → 服务器域名）'
  }
  return '连不上：' + msg
}

/** wx.request 的 Promise 包装。只负责发出去和收回来，不判断业务成败。 */
function raw(opts) {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: opts.url,
      method: opts.method,
      header: opts.header || {},
      data: opts.data,
      timeout: TIMEOUT_MS,
      responseType: opts.responseType,
      success: function (res) { resolve({ statusCode: res.statusCode, data: res.data }) },
      fail: function (e) { reject(err('UNREACHABLE', describeFail(e, opts.url))) }
    })
  })
}

/** 打中台。凭据放请求头——放 URL 会被中间每一层访问日志记下来。 */
function callApi(method, path, body) {
  var token = getToken()
  if (!token) {
    return Promise.reject(err('NO_TOKEN', '还没填上传凭据。去「我的」把你的 license key 填进去。'))
  }
  return raw({
    url: apiBase() + path,
    method: method,
    header: { 'X-Upload-Token': token, 'Content-Type': 'application/json' },
    data: body
  }).then(function (res) {
    if (res.statusCode === 401 || res.statusCode === 403) {
      throw err('BAD_TOKEN', '中台不认这个凭据（HTTP ' + res.statusCode + '）。去「我的」检查一下 license key。')
    }
    var d = res.data
    if (res.statusCode !== 200 || !d || d.success !== true) {
      var reason = (d && d.error && d.error.message) || ('HTTP ' + res.statusCode)
      var e = err('API_FAILED', reason)
      // 上层要按服务端错误码翻译人话（EDIT_LOCKED / NoActiveAgent……），
      // 靠 grep 消息文本认错误是在赌服务端措辞不变——把码和状态原样带上
      e.status = res.statusCode
      e.serverCode = (d && d.error && d.error.code) || ''
      throw e
    }
    return d.data || {}
  })
}

/**
 * 列素材。
 * 尾斜杠不能省：中台 nginx 的 location 是 /api/materials/，不带斜杠会吃一个 301，
 * 而 wx.request 不跟随重定向。
 */
function listMaterials(options) {
  var opts = options || {}
  var limit = opts.limit || DEFAULT_LIMIT
  return callApi('GET', '/api/materials/?limit=' + limit, undefined)
    .then(function (data) {
      return { items: data.items || [], total: data.total }
    })
}

/**
 * 删一条素材。中台会一起删掉 COS 里的对象。
 * 被已发布作品用着时中台回 409 IN_USE，消息里带着是哪个作品挡着——原样往上抛，
 * 只说「删不掉」等于没说，用户不知道下一步该干嘛。
 */
function deleteMaterial(id) {
  var mid = String(id || '').trim()
  if (!mid) return Promise.reject(err('BAD_REQUEST', '没有指定要删哪条'))
  return callApi('DELETE', '/api/materials/' + mid, undefined)
    .then(function (data) { return { id: data.id || mid } })
}

/**
 * 列作品（contents）。上传 complete 落库时中台建的就是它，
 * 发布回执（receipts）也回写在它身上——发布页取缩略图、作品列表看回执都走这里。
 * 尾斜杠同 listMaterials：中台 nginx 不带斜杠会吃 301，wx.request 不跟随重定向。
 */
function listContents(options) {
  var opts = options || {}
  var qs = []
  if (opts.status) qs.push('status=' + encodeURIComponent(opts.status))
  qs.push('limit=' + (opts.limit || DEFAULT_LIMIT))
  if (opts.offset) qs.push('offset=' + opts.offset)
  return callApi('GET', '/api/contents/?' + qs.join('&'), undefined)
    .then(function (data) {
      return { items: data.items || [], total: data.total }
    })
}

/**
 * 改作品的标题/文案/平台。只带调用方给了的字段——PATCH 的语义就是只改给了的，
 * 把没改的字段也发过去会把别的入口（Notion/飞书编排台）刚写的值顶掉。
 *
 * 已进发布队列的作品中台锁编辑（409 EDIT_LOCKED）。这里必须翻译成人话：
 * 把服务端错误码直接怼给客户，客户不知道下一步该干嘛。
 */
function patchContent(id, fields) {
  var cid = String(id || '').trim()
  if (!cid) return Promise.reject(err('BAD_REQUEST', '没有指定要改哪个作品'))
  var f = fields || {}
  var body = {}
  if (f.title !== undefined) body.title = f.title
  if (f.body !== undefined) body.body = f.body
  if (f.platforms !== undefined) body.platforms = f.platforms
  return callApi('PATCH', '/api/contents/' + cid, body)
    .catch(function (e) {
      if (e.code === 'API_FAILED' && (e.serverCode === 'EDIT_LOCKED' || e.status === 409)) {
        throw err('EDIT_LOCKED', '作品已在发布队列，不能再改。等这单发完，或先在作品列表把它撤下来。')
      }
      throw e
    })
}

/**
 * 把作品送进发布队列。不带 body——按作品自己的 platforms 整单发，
 * 发哪些平台在 patchContent 那一步就定好了，这里不重复传一份让两处打架。
 *
 * 撞上发布手机不在线（NoActiveAgent 一类，HTTP 码服务端可能给 409 也可能给 5xx，
 * 按 error.code 认，409 兜底）必须说清「草稿已保存，稍后可重试」——
 * 不说这句客户会以为刚填的标题文案全白填了。其余失败按服务端 error/message 透传。
 */
function publishContent(id) {
  var cid = String(id || '').trim()
  if (!cid) return Promise.reject(err('BAD_REQUEST', '没有指定要发哪个作品'))
  return callApi('POST', '/api/contents/' + cid + '/publish', undefined)
    .catch(function (e) {
      if (e.code === 'API_FAILED' && (/agent/i.test(e.serverCode || '') || e.status === 409)) {
        throw err('NO_AGENT', '发布手机不在线，作品已存草稿，稍后可重试。（中台说：' + e.message + '）')
      }
      throw e
    })
}

/** 把本地临时文件读成 ArrayBuffer。读不出来就别往下走。 */
function readLocal(filePath) {
  return new Promise(function (resolve, reject) {
    wx.getFileSystemManager().readFile({
      filePath: filePath,
      success: function (res) { resolve(res.data) },
      fail: function (e) { reject(err('READ_FAILED', '读不到这个文件：' + ((e && e.errMsg) || '未知'))) }
    })
  })
}

/**
 * 传一个文件。走上面说的三步。
 *
 * 每一步的失败码都不同，因为后果完全不同：换地址失败什么都没发生；PUT 失败
 * 文件没上去；而回调失败时**文件已经在 COS 里了**——这时说「上传失败」会让人
 * 反复重传同一个文件，所以那一条的消息必须写明白。
 */
function uploadFile(options) {
  var opts = options || {}
  var fileName = String(opts.fileName || '').trim()
  var mimeType = opts.mimeType || 'application/octet-stream'
  var signed = null
  var buf = null

  return readLocal(opts.filePath)
    .then(function (b) {
      // 体积以真实读回的字节数为准，不信调用方自报——中台 complete 会 HEAD 校验，
      // 对不上直接拒，那时文件已经在 COS 里了，白传一趟
      if (!b || !b.byteLength) throw err('EMPTY_FILE', '文件是空的，不往中台传')
      buf = b
      return callApi('POST', '/api/materials/upload-urls/', {
        files: [{ file_name: fileName, size_bytes: buf.byteLength, mime_type: mimeType }],
        title: opts.title || null
      })
    })
    .catch(function (e) {
      if (e.code === 'API_FAILED') throw err('SIGN_FAILED', '换上传地址失败：' + e.message)
      throw e
    })
    .then(function (data) {
      signed = ((data.files || [])[0]) || null
      if (!signed || !signed.upload_url) throw err('SIGN_FAILED', '中台没返回上传地址')

      // ② 文件本体直接进 COS。这一步绝不带 X-Upload-Token——签名在 URL 里，
      //    多带一个头会让 COS 参与签名校验的头集合对不上，直接 403
      return raw({
        url: signed.upload_url,
        method: 'PUT',
        header: { 'Content-Type': mimeType },
        data: buf
      }).catch(function (e) {
        throw err('PUT_FAILED', '传进存储失败：' + e.message)
      })
    })
    .then(function (res) {
      if (res.statusCode !== 200) throw err('PUT_FAILED', '传进存储被拒（HTTP ' + res.statusCode + '）')

      return callApi('POST', '/api/materials/complete/', {
        files: [{
          storage_key: signed.storage_key,
          material_id: signed.material_id,
          file_name: fileName,
          mime_type: mimeType,
          size_bytes: buf.byteLength
        }],
        title: opts.title || null
      }).catch(function (e) {
        // 文件此刻已经在 COS 里了。说成「上传失败」会让人反复重传
        if (e.code === 'UNREACHABLE') {
          throw err('COMPLETE_UNREACHABLE', '文件已进存储，但回中台记账时断了：' + e.message)
        }
        if (e.code === 'API_FAILED') {
          throw err('COMPLETE_FAILED', '文件已进存储，但落库被拒：' + e.message)
        }
        throw e
      })
    })
    .then(function (data) {
      var mat = ((data.materials || [])[0]) || {}
      return {
        materialId: mat.id || signed.material_id,
        fileName: fileName,
        sizeBytes: buf.byteLength,
        // 服务端认出这个文件之前传过。不是错误，界面要能说人话
        deduped: Boolean(mat.deduped),
        contentId: data.content_id || null
      }
    })
}

module.exports = {
  getToken: getToken,
  setToken: setToken,
  clearToken: clearToken,
  apiBase: apiBase,
  listMaterials: listMaterials,
  deleteMaterial: deleteMaterial,
  listContents: listContents,
  patchContent: patchContent,
  publishContent: publishContent,
  uploadFile: uploadFile
}
