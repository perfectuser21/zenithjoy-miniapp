/**
 * zj-api 作品（contents）三个函数的契约 —— 小程序直发的 API 层。
 *
 * 直发链路：上传完素材中台建了作品（content）→ 客户在发布页改标题/文案/选平台
 * → PATCH 存回去 → POST publish 进发布队列 → 真机 worker 发出去回执回写。
 *
 * ── 三件最要紧的事 ────────────────────────────────────────────────────
 * ① 每个失败分支要能分辨（code + 人话 message），网络错/凭据错/业务拒绝
 *    是三种完全不同的"下一步"，不能糊成一句「失败」。
 * ② 已进发布队列的作品中台锁编辑（409 EDIT_LOCKED），要翻译成人话——
 *    「作品已在发布队列，不能再改」，不能把服务端错误码直接怼给客户。
 * ③ publish 撞上发布手机不在线（409 / NoActiveAgent 一类），必须说清
 *    「草稿已保存，稍后可重试」——否则客户会以为白填了一遍。
 */

const PATH = '../../miniprogram/utils/zj-api.js'

/** 按调用顺序依次返回预设响应，并记录每次 wx.request 的入参 */
function stubSeq(steps) {
  let i = 0
  wx.request.mockImplementation((opts) => {
    const step = steps[i++] || { statusCode: 200, data: {} }
    setTimeout(() => {
      if (step.error) {
        opts.fail && opts.fail({ errMsg: 'request:fail ' + step.error })
      } else {
        opts.success && opts.success({ statusCode: step.statusCode, data: step.data })
      }
    }, 0)
  })
}

function load() {
  jest.resetModules()
  return require(PATH)
}

const CONTENT = {
  id: 'c1',
  title: '十一月的湖',
  body: '湖边走了一圈',
  type: 'image',
  platforms: ['douyin'],
  status: 'draft',
  scheduled_at: null,
  preview_url: 'https://x/p.jpg',
  receipts: []
}

let storage

beforeEach(() => {
  storage = { zj_upload_token: 'ZJ-F-TESTKEY' }
  wx.getStorageSync = jest.fn((k) => storage[k])
  wx.setStorageSync = jest.fn((k, v) => { storage[k] = v })
  wx.removeStorageSync = jest.fn((k) => { delete storage[k] })
  wx.request = jest.fn()
  wx.getAccountInfoSync = jest.fn(() => ({ miniProgram: { envVersion: 'trial' } }))
})

describe('listContents 列作品', () => {
  it('拿到 items 原样返回，回执/预览字段不丢', async () => {
    stubSeq([{ statusCode: 200, data: { success: true, data: { items: [CONTENT], total: 1 } } }])
    const api = load()
    const r = await api.listContents()
    expect(r.items).toHaveLength(1)
    expect(r.items[0].preview_url).toBe('https://x/p.jpg')
    expect(r.items[0].receipts).toEqual([])
    expect(r.total).toBe(1)
  })

  it('status/limit/offset 进查询串；凭据只在请求头，绝不进 URL', async () => {
    stubSeq([{ statusCode: 200, data: { success: true, data: { items: [] } } }])
    const api = load()
    await api.listContents({ status: 'draft', limit: 20, offset: 40 })
    const call = wx.request.mock.calls[0][0]
    expect(call.method).toBe('GET')
    expect(call.url).toContain('status=draft')
    expect(call.url).toContain('limit=20')
    expect(call.url).toContain('offset=40')
    expect(call.header['X-Upload-Token']).toBe('ZJ-F-TESTKEY')
    expect(call.url).not.toContain('ZJ-F-TESTKEY')
  })

  it('路径带尾斜杠 —— 和素材一样，中台 nginx 不带斜杠会吃 301 而 wx.request 不跟随', async () => {
    stubSeq([{ statusCode: 200, data: { success: true, data: { items: [] } } }])
    const api = load()
    await api.listContents()
    expect(wx.request.mock.calls[0][0].url).toMatch(/\/api\/contents\/\?/)
  })

  it('没填凭据 → NO_TOKEN，一个请求都不发', async () => {
    storage = {}
    const api = load()
    await expect(api.listContents()).rejects.toMatchObject({ code: 'NO_TOKEN' })
    expect(wx.request).not.toHaveBeenCalled()
  })

  it('网络连不上 → UNREACHABLE，不是空列表', async () => {
    stubSeq([{ error: 'timeout' }])
    const api = load()
    await expect(api.listContents()).rejects.toMatchObject({ code: 'UNREACHABLE' })
  })

  it('凭据被拒（401）→ BAD_TOKEN，消息指路「我的」', async () => {
    stubSeq([{ statusCode: 401, data: {} }])
    const api = load()
    await expect(api.listContents()).rejects.toMatchObject({
      code: 'BAD_TOKEN',
      message: expect.stringContaining('我的')
    })
  })

  it('中台 500 → API_FAILED，带上服务端给的原因', async () => {
    stubSeq([{ statusCode: 500, data: { success: false, error: { message: '数据库连接池耗尽' } } }])
    const api = load()
    await expect(api.listContents()).rejects.toMatchObject({
      code: 'API_FAILED',
      message: expect.stringContaining('数据库连接池耗尽')
    })
  })

  it('回的不是 JSON（比如网关吐 HTML）→ API_FAILED，不能当成空列表咽下去', async () => {
    stubSeq([{ statusCode: 200, data: '<html>502 Bad Gateway</html>' }])
    const api = load()
    await expect(api.listContents()).rejects.toMatchObject({ code: 'API_FAILED' })
  })
})

describe('patchContent 改作品', () => {
  it('成功 → PATCH /api/contents/:id，body 只带传入的字段', async () => {
    stubSeq([{ statusCode: 200, data: { success: true, data: Object.assign({}, CONTENT, { title: '新标题' }) } }])
    const api = load()
    const r = await api.patchContent('c1', { title: '新标题', body: '新文案', platforms: ['douyin', 'weibo'] })
    expect(r.title).toBe('新标题')
    const call = wx.request.mock.calls[0][0]
    expect(call.method).toBe('PATCH')
    expect(call.url).toContain('/api/contents/c1')
    expect(call.data).toEqual({ title: '新标题', body: '新文案', platforms: ['douyin', 'weibo'] })
  })

  it('没传的字段不进 body —— PATCH 的语义就是只改给了的', async () => {
    stubSeq([{ statusCode: 200, data: { success: true, data: CONTENT } }])
    const api = load()
    await api.patchContent('c1', { title: '只改标题' })
    expect(wx.request.mock.calls[0][0].data).toEqual({ title: '只改标题' })
  })

  it('已在发布队列（409 EDIT_LOCKED）→ 人话：作品已在发布队列，不能再改', async () => {
    stubSeq([{ statusCode: 409, data: { success: false, error: { code: 'EDIT_LOCKED', message: 'content is locked' } } }])
    const api = load()
    await expect(api.patchContent('c1', { title: 'x' })).rejects.toMatchObject({
      code: 'EDIT_LOCKED',
      message: expect.stringContaining('作品已在发布队列，不能再改')
    })
  })

  it('没传 id → BAD_REQUEST，不发请求', async () => {
    const api = load()
    await expect(api.patchContent('', { title: 'x' })).rejects.toMatchObject({ code: 'BAD_REQUEST' })
    expect(wx.request).not.toHaveBeenCalled()
  })

  it('凭据被拒（403）→ BAD_TOKEN', async () => {
    stubSeq([{ statusCode: 403, data: {} }])
    const api = load()
    await expect(api.patchContent('c1', { title: 'x' })).rejects.toMatchObject({ code: 'BAD_TOKEN' })
  })

  it('中台 500 → API_FAILED，服务端原因原样透传', async () => {
    stubSeq([{ statusCode: 500, data: { success: false, error: { message: '写库失败' } } }])
    const api = load()
    await expect(api.patchContent('c1', { title: 'x' })).rejects.toMatchObject({
      code: 'API_FAILED',
      message: expect.stringContaining('写库失败')
    })
  })

  it('网络断 → UNREACHABLE', async () => {
    stubSeq([{ error: 'timeout' }])
    const api = load()
    await expect(api.patchContent('c1', { title: 'x' })).rejects.toMatchObject({ code: 'UNREACHABLE' })
  })
})

describe('publishContent 进发布队列', () => {
  it('成功 → POST /api/contents/:id/publish，不带 body（按作品自己的 platforms 整单发）', async () => {
    stubSeq([{ statusCode: 200, data: { success: true, data: { id: 'c1', status: 'queued' } } }])
    const api = load()
    const r = await api.publishContent('c1')
    expect(r.status).toBe('queued')
    const call = wx.request.mock.calls[0][0]
    expect(call.method).toBe('POST')
    expect(call.url).toContain('/api/contents/c1/publish')
    expect(call.data).toBeUndefined()
  })

  it('发布手机不在线（409 NoActiveAgent 一类）→ 人话：手机不在线，草稿已存，稍后可重试', async () => {
    stubSeq([{ statusCode: 409, data: { success: false, error: { code: 'NoActiveAgent', message: 'no active agent for tenant t1' } } }])
    const api = load()
    await expect(api.publishContent('c1')).rejects.toMatchObject({
      code: 'NO_AGENT',
      message: expect.stringContaining('发布手机不在线')
    })
  })

  it('不在线的人话里要带"已存草稿" —— 不说这句客户会以为白填了一遍', async () => {
    stubSeq([{ statusCode: 409, data: { success: false, error: { code: 'NoActiveAgent', message: 'no active agent' } } }])
    const api = load()
    const e = await api.publishContent('c1').then(() => null, (x) => x)
    expect(e.message).toContain('草稿')
    expect(e.message).toContain('重试')
  })

  it('中台 500 → API_FAILED，按响应 error/message 透传兜底', async () => {
    stubSeq([{ statusCode: 500, data: { success: false, error: { message: '派单 worker 崩了' } } }])
    const api = load()
    await expect(api.publishContent('c1')).rejects.toMatchObject({
      code: 'API_FAILED',
      message: expect.stringContaining('派单 worker 崩了')
    })
  })

  it('网络断 → UNREACHABLE', async () => {
    stubSeq([{ error: 'ECONNRESET' }])
    const api = load()
    await expect(api.publishContent('c1')).rejects.toMatchObject({ code: 'UNREACHABLE' })
  })

  it('没传 id → BAD_REQUEST，不发请求', async () => {
    const api = load()
    await expect(api.publishContent('')).rejects.toMatchObject({ code: 'BAD_REQUEST' })
    expect(wx.request).not.toHaveBeenCalled()
  })
})
