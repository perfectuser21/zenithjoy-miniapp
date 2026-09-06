/**
 * syncMaterial 云函数单测。
 *
 * 这条链比 listMaterials 危险：它有 4 个外部调用（微信云存储 / 换地址 / PUT 存储 /
 * 回调落库），**中间任何一步失败，文件可能已经进了 COS 但没落库**。
 *
 * 所以最要紧的不是"成功路径对不对"，而是：
 *   ① 每一步失败都要有独立的、能诊断的错误码
 *   ② 文件已进存储但回调失败时，消息必须说清楚「文件在，只是没落库」——
 *      否则用户会以为传丢了、反复重传
 *   ③ 空文件不能往中台传
 */

const https = require('https')
const { EventEmitter } = require('events')

const downloadFile = jest.fn()
jest.mock('wx-server-sdk', () => ({
  init: jest.fn(),
  DYNAMIC_CURRENT_ENV: 'dynamic',
  downloadFile: (...a) => downloadFile(...a)
}), { virtual: true })

/**
 * 按调用顺序依次返回预设响应。
 * 顺序：① upload-urls  ② PUT 存储  ③ complete
 */
function stubSeq(steps) {
  let i = 0
  jest.spyOn(https, 'request').mockImplementation((opts, cb) => {
    const step = steps[i++] || { statusCode: 200, body: '{}' }
    const req = new EventEmitter()
    req.write = () => {}
    req.end = () => {
      if (step.error) { setImmediate(() => req.emit('error', new Error(step.error))); return }
      const res = new EventEmitter()
      res.statusCode = step.statusCode
      setImmediate(() => {
        cb(res)
        res.emit('data', Buffer.from(step.body || ''))
        res.emit('end')
      })
    }
    req.destroy = (e) => req.emit('error', e)
    return req
  })
}

function load() {
  jest.resetModules()
  return require('../../cloudfunctions/syncMaterial/index.js')
}

const SIGN_OK = JSON.stringify({
  success: true,
  data: { files: [{ material_id: 'm1', storage_key: 't1/m1/a.jpg', upload_url: 'https://cos.test/put?sig=1' }] }
})
const DONE_OK = JSON.stringify({
  success: true,
  data: { content_id: 'c1', materials: [{ id: 'm1', file_name: 'a.jpg', deduped: false }] }
})

const EV = { fileID: 'cloud://x/a.jpg', fileName: 'a.jpg', mimeType: 'image/jpeg' }

beforeEach(() => {
  process.env.ZJ_API_BASE = 'https://staging.test'
  process.env.ZJ_UPLOAD_TOKEN = 'ZJ-F-TESTKEY'
  downloadFile.mockReset()
  downloadFile.mockResolvedValue({ fileContent: Buffer.alloc(1024, 7) })
})
afterEach(() => {
  delete process.env.ZJ_API_BASE
  delete process.env.ZJ_UPLOAD_TOKEN
  jest.restoreAllMocks()
})

describe('syncMaterial — 入参与配置', () => {
  it('没配环境变量 → NOT_CONFIGURED，不去读云存储', async () => {
    delete process.env.ZJ_API_BASE
    const fn = load()
    const r = await fn.main(EV)
    expect(r.code).toBe('NOT_CONFIGURED')
    expect(downloadFile).not.toHaveBeenCalled()
  })

  it('缺 fileID 或 fileName → BAD_REQUEST', async () => {
    const fn = load()
    expect((await fn.main({ fileName: 'a.jpg' })).code).toBe('BAD_REQUEST')
    expect((await fn.main({ fileID: 'cloud://x' })).code).toBe('BAD_REQUEST')
  })
})

describe('syncMaterial — 成功路径', () => {
  it('四步走完 → ok:true，带回 materialId 和 contentId', async () => {
    stubSeq([
      { statusCode: 200, body: SIGN_OK },
      { statusCode: 200, body: '' },
      { statusCode: 200, body: DONE_OK }
    ])
    const fn = load()
    const r = await fn.main(EV)
    expect(r.ok).toBe(true)
    expect(r.materialId).toBe('m1')
    expect(r.contentId).toBe('c1')
    expect(r.sizeBytes).toBe(1024)
  })

  it('PUT 存储那一步不带任何鉴权头 —— 签名在 URL 里，多加头反而 403', async () => {
    stubSeq([
      { statusCode: 200, body: SIGN_OK },
      { statusCode: 200, body: '' },
      { statusCode: 200, body: DONE_OK }
    ])
    const fn = load()
    await fn.main(EV)
    const putOpts = https.request.mock.calls[1][0]
    expect(putOpts.method).toBe('PUT')
    expect(putOpts.headers['X-Upload-Token']).toBeUndefined()
    expect(putOpts.headers.Authorization).toBeUndefined()
  })

  it('中台报去重命中 → deduped:true，这不是错误', async () => {
    const dedup = JSON.stringify({
      success: true,
      data: { content_id: 'c1', materials: [{ id: 'old-id', file_name: 'a.jpg', deduped: true }] }
    })
    stubSeq([
      { statusCode: 200, body: SIGN_OK },
      { statusCode: 200, body: '' },
      { statusCode: 200, body: dedup }
    ])
    const fn = load()
    const r = await fn.main(EV)
    expect(r.ok).toBe(true)
    expect(r.deduped).toBe(true)
    expect(r.materialId).toBe('old-id')
  })

  it('真实体积用云存储读回来的字节数，不信客户端自报', async () => {
    downloadFile.mockResolvedValue({ fileContent: Buffer.alloc(4096) })
    stubSeq([
      { statusCode: 200, body: SIGN_OK },
      { statusCode: 200, body: '' },
      { statusCode: 200, body: DONE_OK }
    ])
    const fn = load()
    const r = await fn.main(Object.assign({}, EV, { sizeBytes: 999999 }))
    expect(r.sizeBytes).toBe(4096)
    const signBody = JSON.parse(https.request.mock.calls[0][0].__body || '{}')
    expect(r.ok).toBe(true)
  })
})

describe('syncMaterial — 每一步失败都要能诊断', () => {
  it('云存储读不到 → CLOUD_DOWNLOAD_FAILED，不往中台传', async () => {
    downloadFile.mockRejectedValue(new Error('file not found'))
    const spy = jest.spyOn(https, 'request')
    const fn = load()
    const r = await fn.main(EV)
    expect(r.code).toBe('CLOUD_DOWNLOAD_FAILED')
    expect(spy).not.toHaveBeenCalled()
  })

  it('空文件 → EMPTY_FILE，绝不往中台传一个 0 字节', async () => {
    downloadFile.mockResolvedValue({ fileContent: Buffer.alloc(0) })
    const spy = jest.spyOn(https, 'request')
    const fn = load()
    expect((await fn.main(EV)).code).toBe('EMPTY_FILE')
    expect(spy).not.toHaveBeenCalled()
  })

  it('换地址被拒 401 → UPSTREAM_AUTH_FAILED', async () => {
    stubSeq([{ statusCode: 401, body: '{}' }])
    const fn = load()
    expect((await fn.main(EV)).code).toBe('UPSTREAM_AUTH_FAILED')
  })

  it('换地址失败 → SIGN_FAILED，带上中台给的原因', async () => {
    stubSeq([{ statusCode: 400, body: '{"success":false,"error":{"message":"FILE_TOO_LARGE 超过 2GB"}}' }])
    const fn = load()
    const r = await fn.main(EV)
    expect(r.code).toBe('SIGN_FAILED')
    expect(r.message).toContain('2GB')
  })

  it('PUT 存储被拒 → COS_PUT_FAILED，不会去调 complete', async () => {
    stubSeq([
      { statusCode: 200, body: SIGN_OK },
      { statusCode: 403, body: '' }
    ])
    const fn = load()
    const r = await fn.main(EV)
    expect(r.code).toBe('COS_PUT_FAILED')
    expect(https.request).toHaveBeenCalledTimes(2)   // 没有第三步
  })

  it('文件已进存储但回调连不上 → 消息必须说清「文件在，只是没落库」', async () => {
    // 这条最要紧：说成「上传失败」会让用户反复重传，而文件其实已经在 COS 里了
    stubSeq([
      { statusCode: 200, body: SIGN_OK },
      { statusCode: 200, body: '' },
      { error: 'ECONNRESET' }
    ])
    const fn = load()
    const r = await fn.main(EV)
    expect(r.code).toBe('COMPLETE_UNREACHABLE')
    expect(r.message).toContain('已进存储')
  })

  it('回调落库被中台拒 → COMPLETE_FAILED，带上原因', async () => {
    stubSeq([
      { statusCode: 200, body: SIGN_OK },
      { statusCode: 200, body: '' },
      { statusCode: 400, body: '{"success":false,"error":{"message":"SIZE_MISMATCH"}}' }
    ])
    const fn = load()
    const r = await fn.main(EV)
    expect(r.code).toBe('COMPLETE_FAILED')
    expect(r.message).toContain('SIZE_MISMATCH')
  })

  it('所有失败都带 ok:false，界面可以无脑判断', async () => {
    const cases = [
      () => downloadFile.mockRejectedValue(new Error('x')),
      () => { downloadFile.mockResolvedValue({ fileContent: Buffer.alloc(0) }) }
    ]
    for (const setup of cases) {
      jest.restoreAllMocks()
      downloadFile.mockReset()
      downloadFile.mockResolvedValue({ fileContent: Buffer.alloc(10) })
      setup()
      const fn = load()
      const r = await fn.main(EV)
      expect(r.ok).toBe(false)
      expect(typeof r.code).toBe('string')
      expect(typeof r.message).toBe('string')
    }
  })
})
