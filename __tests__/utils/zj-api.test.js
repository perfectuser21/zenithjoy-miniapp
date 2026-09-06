/**
 * zj-api 单测 —— 小程序直连 ZenithJoy 中台的唯一通道。
 *
 * 这一层取代了原来的云函数中转（云开发环境拿不到部署权限，而且多一跳没有收益）。
 * 中台域名和 COS 域名都已进微信后台的 request 合法域名，wx.request 可以直打。
 *
 * ── 三件最要紧的事 ────────────────────────────────────────────────────
 * ① 凭据由客户自己在「我的」里填，不写死在代码里。没填要说人话，不能空列表。
 * ② 上传三步（换地址 / PUT 存储 / 回调落库）每一步失败要能分辨，尤其
 *    「已进存储但没落库」必须说清楚，否则用户会反复重传已经传上去的文件。
 * ③ PUT 存储那一步绝不能带 X-Upload-Token —— 签名在 URL 里，多带头会 403。
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

const COS_URL = 'https://zenithjoy-materials-1333590468.cos.ap-guangzhou.myqcloud.com/t1/m1/a.jpg?sign=1'
const SIGN_OK = {
  success: true,
  data: { files: [{ material_id: 'm1', storage_key: 't1/m1/a.jpg', upload_url: COS_URL }] }
}
const DONE_OK = {
  success: true,
  data: { content_id: 'c1', materials: [{ id: 'm1', file_name: 'a.jpg', deduped: false }] }
}

let storage

beforeEach(() => {
  storage = { zj_upload_token: 'ZJ-F-TESTKEY' }
  wx.getStorageSync = jest.fn((k) => storage[k])
  wx.setStorageSync = jest.fn((k, v) => { storage[k] = v })
  wx.removeStorageSync = jest.fn((k) => { delete storage[k] })
  wx.request = jest.fn()
  wx.getFileSystemManager = jest.fn(() => ({
    readFile: ({ filePath, success, fail }) => {
      if (filePath === '__missing__') { setTimeout(() => fail({ errMsg: 'readFile:fail no such file' }), 0); return }
      const size = filePath === '__empty__' ? 0 : 1024
      setTimeout(() => success({ data: new ArrayBuffer(size) }), 0)
    }
  }))
  wx.getAccountInfoSync = jest.fn(() => ({ miniProgram: { envVersion: 'trial' } }))
})

describe('凭据', () => {
  it('没填凭据 → NO_TOKEN，且一个请求都不发', async () => {
    storage = {}
    const api = load()
    await expect(api.listMaterials()).rejects.toMatchObject({ code: 'NO_TOKEN' })
    expect(wx.request).not.toHaveBeenCalled()
  })

  it('凭据存取走本机 storage，不进代码', () => {
    const api = load()
    api.setToken('  ZJ-F-ABC  ')
    expect(storage.zj_upload_token).toBe('ZJ-F-ABC')   // 前后空格要吃掉，粘贴常带
    expect(api.getToken()).toBe('ZJ-F-ABC')
    api.clearToken()
    expect(api.getToken()).toBe('')
  })

  it('中台拒绝凭据 → BAD_TOKEN，消息要指路「我的」', async () => {
    stubSeq([{ statusCode: 401, data: {} }])
    const api = load()
    await expect(api.listMaterials()).rejects.toMatchObject({
      code: 'BAD_TOKEN',
      message: expect.stringContaining('我的')
    })
  })
})

describe('环境选择', () => {
  it('体验版/开发版打 staging', async () => {
    stubSeq([{ statusCode: 200, data: { success: true, data: { items: [] } } }])
    const api = load()
    await api.listMaterials()
    expect(wx.request.mock.calls[0][0].url).toContain('staging-autopilot.zenjoymedia.media')
  })

  it('正式版打生产，绝不能偷偷打 staging', async () => {
    wx.getAccountInfoSync = jest.fn(() => ({ miniProgram: { envVersion: 'release' } }))
    stubSeq([{ statusCode: 200, data: { success: true, data: { items: [] } } }])
    const api = load()
    await api.listMaterials()
    const url = wx.request.mock.calls[0][0].url
    expect(url).toContain('https://autopilot.zenjoymedia.media')
    expect(url).not.toContain('staging')
  })
})

describe('列素材', () => {
  it('拿到 items 原样返回', async () => {
    stubSeq([{ statusCode: 200, data: { success: true, data: { items: [{ id: 'm1', file_name: 'a.jpg' }] } } }])
    const api = load()
    const r = await api.listMaterials()
    expect(r.items).toHaveLength(1)
    expect(r.items[0].file_name).toBe('a.jpg')
  })

  it('路径带尾斜杠 —— 中台 nginx 的 location 带斜杠，不带会吃 301', async () => {
    stubSeq([{ statusCode: 200, data: { success: true, data: { items: [] } } }])
    const api = load()
    await api.listMaterials()
    expect(wx.request.mock.calls[0][0].url).toMatch(/\/api\/materials\/\?/)
  })

  it('凭据放请求头，不放 URL —— 放 URL 会进各层访问日志', async () => {
    stubSeq([{ statusCode: 200, data: { success: true, data: { items: [] } } }])
    const api = load()
    await api.listMaterials()
    const call = wx.request.mock.calls[0][0]
    expect(call.header['X-Upload-Token']).toBe('ZJ-F-TESTKEY')
    expect(call.url).not.toContain('ZJ-F-TESTKEY')
  })

  it('网络连不上 → UNREACHABLE，不是空列表', async () => {
    stubSeq([{ error: 'timeout' }])
    const api = load()
    await expect(api.listMaterials()).rejects.toMatchObject({ code: 'UNREACHABLE' })
  })
})

describe('上传三步', () => {
  it('走完三步 → 返回 materialId', async () => {
    stubSeq([
      { statusCode: 200, data: SIGN_OK },
      { statusCode: 200, data: '' },
      { statusCode: 200, data: DONE_OK }
    ])
    const api = load()
    const r = await api.uploadFile({ filePath: '/tmp/a.jpg', fileName: 'a.jpg', mimeType: 'image/jpeg' })
    expect(r.materialId).toBe('m1')
    expect(r.deduped).toBe(false)
    expect(wx.request).toHaveBeenCalledTimes(3)
  })

  it('PUT 存储那一步不带 X-Upload-Token —— 签名在 URL 里，多带头 403', async () => {
    stubSeq([
      { statusCode: 200, data: SIGN_OK },
      { statusCode: 200, data: '' },
      { statusCode: 200, data: DONE_OK }
    ])
    const api = load()
    await api.uploadFile({ filePath: '/tmp/a.jpg', fileName: 'a.jpg', mimeType: 'image/jpeg' })
    const put = wx.request.mock.calls[1][0]
    expect(put.method).toBe('PUT')
    expect(put.url).toBe(COS_URL)
    expect(put.header['X-Upload-Token']).toBeUndefined()
  })

  it('体积用真实读回的字节数，不信调用方自报', async () => {
    stubSeq([
      { statusCode: 200, data: SIGN_OK },
      { statusCode: 200, data: '' },
      { statusCode: 200, data: DONE_OK }
    ])
    const api = load()
    await api.uploadFile({ filePath: '/tmp/a.jpg', fileName: 'a.jpg', mimeType: 'image/jpeg', sizeBytes: 999999 })
    expect(wx.request.mock.calls[0][0].data.files[0].size_bytes).toBe(1024)
  })

  it('去重命中 → deduped:true，这不是错误', async () => {
    stubSeq([
      { statusCode: 200, data: SIGN_OK },
      { statusCode: 200, data: '' },
      { statusCode: 200, data: { success: true, data: { content_id: 'c1', materials: [{ id: 'old', deduped: true }] } } }
    ])
    const api = load()
    const r = await api.uploadFile({ filePath: '/tmp/a.jpg', fileName: 'a.jpg', mimeType: 'image/jpeg' })
    expect(r.deduped).toBe(true)
    expect(r.materialId).toBe('old')
  })
})

describe('上传每一步失败都要能分辨', () => {
  it('读不到本地文件 → READ_FAILED，不发任何请求', async () => {
    const api = load()
    await expect(api.uploadFile({ filePath: '__missing__', fileName: 'a.jpg' }))
      .rejects.toMatchObject({ code: 'READ_FAILED' })
    expect(wx.request).not.toHaveBeenCalled()
  })

  it('空文件 → EMPTY_FILE，绝不往中台传 0 字节', async () => {
    const api = load()
    await expect(api.uploadFile({ filePath: '__empty__', fileName: 'a.jpg' }))
      .rejects.toMatchObject({ code: 'EMPTY_FILE' })
    expect(wx.request).not.toHaveBeenCalled()
  })

  it('换地址被中台拒 → SIGN_FAILED，带上中台给的原因', async () => {
    stubSeq([{ statusCode: 400, data: { success: false, error: { message: 'FILE_TOO_LARGE 超过 2GB' } } }])
    const api = load()
    await expect(api.uploadFile({ filePath: '/tmp/a.jpg', fileName: 'a.jpg' }))
      .rejects.toMatchObject({ code: 'SIGN_FAILED', message: expect.stringContaining('2GB') })
  })

  it('PUT 存储被拒 → PUT_FAILED，且不会去调 complete', async () => {
    stubSeq([
      { statusCode: 200, data: SIGN_OK },
      { statusCode: 403, data: '' }
    ])
    const api = load()
    await expect(api.uploadFile({ filePath: '/tmp/a.jpg', fileName: 'a.jpg' }))
      .rejects.toMatchObject({ code: 'PUT_FAILED' })
    expect(wx.request).toHaveBeenCalledTimes(2)
  })

  it('已进存储但回调失败 → 消息必须说清「文件在，只是没落库」', async () => {
    // 说成「上传失败」会让人把已经在 COS 里的文件反复重传
    stubSeq([
      { statusCode: 200, data: SIGN_OK },
      { statusCode: 200, data: '' },
      { error: 'ECONNRESET' }
    ])
    const api = load()
    await expect(api.uploadFile({ filePath: '/tmp/a.jpg', fileName: 'a.jpg' }))
      .rejects.toMatchObject({ code: 'COMPLETE_UNREACHABLE', message: expect.stringContaining('已进存储') })
  })
})
