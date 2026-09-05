/**
 * listMaterials 云函数单测。
 *
 * 这层的全部价值在【错误分支】：它夹在小程序和香港中台之间，中台连不上、
 * 凭据被拒、环境变量没配——每种都必须给出能诊断的信息。
 *
 * 最要紧的一条：**任何失败都不能返回「空列表」假装一条素材都没有**。
 * 用户看到空九宫格会以为素材丢了，而真实原因可能只是云函数没配环境变量。
 * 静默失败是这条链上最贵的 bug。
 */

const https = require('https')
const { EventEmitter } = require('events')

jest.mock('wx-server-sdk', () => ({
  init: jest.fn(),
  DYNAMIC_CURRENT_ENV: 'dynamic'
}), { virtual: true })

/** 造一个假的 https.request：按给定状态码/响应体回调，或直接抛错。 */
function stubHttps({ statusCode, body, error, timeout }) {
  jest.spyOn(https, 'request').mockImplementation((opts, cb) => {
    const req = new EventEmitter()
    req.end = () => {
      if (error) { setImmediate(() => req.emit('error', new Error(error))); return }
      if (timeout) { setImmediate(() => req.emit('timeout')); return }
      const res = new EventEmitter()
      res.statusCode = statusCode
      setImmediate(() => {
        cb(res)
        res.emit('data', body)
        res.emit('end')
      })
    }
    req.destroy = (err) => { req.emit('error', err) }
    return req
  })
}

function load() {
  jest.resetModules()
  return require('../../cloudfunctions/listMaterials/index.js')
}

const OK_BODY = JSON.stringify({
  success: true,
  data: {
    items: [{ id: 'm1', file_name: 'IMG_7757.jpg', size_bytes: 1427586, preview_url: 'https://cos/x?sig=1' }],
    limit: 30, offset: 0, count: 1
  }
})

describe('listMaterials — 环境变量没配', () => {
  afterEach(() => { delete process.env.ZJ_API_BASE; delete process.env.ZJ_UPLOAD_TOKEN; jest.restoreAllMocks() })

  it('两个都没配 → NOT_CONFIGURED，而不是假装没有素材', async () => {
    const fn = load()
    const r = await fn.main({})
    expect(r.ok).toBe(false)
    expect(r.code).toBe('NOT_CONFIGURED')
    expect(r.message).toMatch(/ZJ_API_BASE|ZJ_UPLOAD_TOKEN/)
    expect(r.items).toEqual([])
  })

  it('只配了地址、缺凭据 → 同样 NOT_CONFIGURED，不会拿空 token 去打中台', async () => {
    process.env.ZJ_API_BASE = 'https://example.test'
    const spy = jest.spyOn(https, 'request')
    const fn = load()
    const r = await fn.main({})
    expect(r.code).toBe('NOT_CONFIGURED')
    expect(spy).not.toHaveBeenCalled()
  })
})

describe('listMaterials — 正常路径', () => {
  beforeEach(() => {
    process.env.ZJ_API_BASE = 'https://staging.test/'
    process.env.ZJ_UPLOAD_TOKEN = 'ZJ-F-TESTKEY'
  })
  afterEach(() => { delete process.env.ZJ_API_BASE; delete process.env.ZJ_UPLOAD_TOKEN; jest.restoreAllMocks() })

  it('中台 200 → 透传 items', async () => {
    stubHttps({ statusCode: 200, body: OK_BODY })
    const fn = load()
    const r = await fn.main({ limit: 60 })
    expect(r.ok).toBe(true)
    expect(r.items).toHaveLength(1)
    expect(r.items[0].file_name).toBe('IMG_7757.jpg')
  })

  it('凭据放在请求头里，不出现在 URL 上（URL 会进日志）', async () => {
    stubHttps({ statusCode: 200, body: OK_BODY })
    const fn = load()
    await fn.main({})
    const opts = https.request.mock.calls[0][0]
    expect(opts.headers['X-Upload-Token']).toBe('ZJ-F-TESTKEY')
    expect(opts.path).not.toContain('ZJ-F-TESTKEY')
  })

  it('base 末尾的斜杠会被去掉，不会拼出 //api/materials', async () => {
    stubHttps({ statusCode: 200, body: OK_BODY })
    const fn = load()
    await fn.main({})
    expect(https.request.mock.calls[0][0].path).toMatch(/^\/api\/materials\?/)
  })

  it('limit 有硬上限 100；非法值回落默认 30', async () => {
    stubHttps({ statusCode: 200, body: OK_BODY })
    const fn = load()

    await fn.main({ limit: 999999 })
    expect(https.request.mock.calls[0][0].path).toContain('limit=100')

    https.request.mockClear()
    await fn.main({ limit: -5 })
    expect(https.request.mock.calls[0][0].path).toContain('limit=30')

    https.request.mockClear()
    await fn.main({ limit: 'abc' })
    expect(https.request.mock.calls[0][0].path).toContain('limit=30')
  })
})

describe('listMaterials — 错误路径都要能诊断，绝不静默', () => {
  beforeEach(() => {
    process.env.ZJ_API_BASE = 'https://staging.test'
    process.env.ZJ_UPLOAD_TOKEN = 'ZJ-F-TESTKEY'
  })
  afterEach(() => { delete process.env.ZJ_API_BASE; delete process.env.ZJ_UPLOAD_TOKEN; jest.restoreAllMocks() })

  it('网络不通 → UPSTREAM_UNREACHABLE，绝不当成「没有素材」', async () => {
    stubHttps({ error: 'ECONNREFUSED' })
    const fn = load()
    const r = await fn.main({})
    expect(r.ok).toBe(false)
    expect(r.code).toBe('UPSTREAM_UNREACHABLE')
    expect(r.message).toContain('ECONNREFUSED')
  })

  it('超时 → 也走 UPSTREAM_UNREACHABLE，消息里带上超时毫秒数', async () => {
    stubHttps({ timeout: true })
    const fn = load()
    const r = await fn.main({})
    expect(r.code).toBe('UPSTREAM_UNREACHABLE')
    expect(r.message).toMatch(/超时/)
  })

  it('401 → UPSTREAM_AUTH_FAILED，且提示去查哪个环境变量', async () => {
    stubHttps({ statusCode: 401, body: '{"success":false}' })
    const fn = load()
    const r = await fn.main({})
    expect(r.code).toBe('UPSTREAM_AUTH_FAILED')
    expect(r.message).toContain('ZJ_UPLOAD_TOKEN')
  })

  it('403 → 同样归到 AUTH_FAILED', async () => {
    stubHttps({ statusCode: 403, body: '{"success":false}' })
    const fn = load()
    expect((await fn.main({})).code).toBe('UPSTREAM_AUTH_FAILED')
  })

  it('500 → UPSTREAM_ERROR，带上中台给的原因', async () => {
    stubHttps({ statusCode: 500, body: '{"success":false,"error":{"message":"LIST_FAILED 库挂了"}}' })
    const fn = load()
    const r = await fn.main({})
    expect(r.code).toBe('UPSTREAM_ERROR')
    expect(r.message).toContain('库挂了')
  })

  it('返回的不是 JSON（比如网关的 HTML 错误页）→ 也能给出可读原因，不崩', async () => {
    stubHttps({ statusCode: 502, body: '<html>502 Bad Gateway</html>' })
    const fn = load()
    const r = await fn.main({})
    expect(r.code).toBe('UPSTREAM_ERROR')
    expect(r.message).toContain('502')
  })

  it('所有失败分支都带 items:[]，前端可以无脑读，不会因 undefined 崩', async () => {
    const cases = [
      { error: 'boom' },
      { statusCode: 401, body: '{}' },
      { statusCode: 500, body: '{}' }
    ]
    for (const c of cases) {
      jest.restoreAllMocks()
      stubHttps(c)
      const fn = load()
      const r = await fn.main({})
      expect(Array.isArray(r.items)).toBe(true)
      expect(r.ok).toBe(false)
    }
  })
})
