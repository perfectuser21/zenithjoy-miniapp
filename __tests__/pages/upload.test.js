/**
 * 上传页的「去发布」入口 —— 传完素材别让人断在半路。
 *
 * 中台在 complete 落库时给每个文件建了作品（content），响应里带 content_id。
 * 上传全部结束后要出一个「去发布」按钮，带着 content_id 跳发布页，
 * 让"拍完→传完→发出去"一条路走通。
 *
 * 现状（读 zj-api.uploadFile 确认）：小程序逐个文件调 complete，一次报一个文件，
 * 所以一次传多张图会各建一个作品、各回一个 content_id。「去发布」用第一个
 * 成功文件的 content_id——先把单文件链路走通，多文件合单是中台侧的事。
 */

const PAGE = '../../miniprogram/pages/upload/upload.js'

let page

function loadPage() {
  jest.resetModules()
  global.__resetPage()
  require(PAGE)
  const p = global.__getLastPage()
  p.data = Object.assign({}, p.data)
  p.setData = function (patch) {
    Object.keys(patch).forEach((k) => { p.data[k] = patch[k] })
  }
  return p
}

/** 按调用顺序依次返回预设响应 */
function stubSeq(steps) {
  let i = 0
  global.wx.request = jest.fn((opts) => {
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

const COS_URL = 'https://zenithjoy-materials-1333590468.cos.ap-guangzhou.myqcloud.com/t1/m1/a.jpg?sign=1'
const SIGN_OK = {
  statusCode: 200,
  data: { success: true, data: { files: [{ material_id: 'm1', storage_key: 't1/m1/a.jpg', upload_url: COS_URL }] } }
}
const PUT_OK = { statusCode: 200, data: '' }
const doneOk = (contentId) => ({
  statusCode: 200,
  data: { success: true, data: { content_id: contentId, materials: [{ id: 'm1', deduped: false }] } }
})
const SIGN_FAIL = { statusCode: 400, data: { success: false, error: { message: 'FILE_TOO_LARGE' } } }

const FILE = { tempFilePath: '/tmp/a.jpg', size: 1024 }

beforeEach(() => {
  global.wx.getStorageSync = jest.fn(() => 'ZJ-F-TESTKEY')
  global.wx.getAccountInfoSync = jest.fn(() => ({ miniProgram: { envVersion: 'trial' } }))
  global.wx.showToast = jest.fn()
  global.wx.navigateTo = jest.fn()
  global.wx.getFileSystemManager = jest.fn(() => ({
    readFile: ({ success }) => setTimeout(() => success({ data: new ArrayBuffer(1024) }), 0)
  }))
  page = loadPage()
})

describe('上传完出「去发布」入口', () => {
  it('单文件传成 → 记下 content_id，「去发布」带着它跳发布页', async () => {
    stubSeq([SIGN_OK, PUT_OK, doneOk('c1')])
    await page.run([FILE], 'image')
    expect(page.data.publishContentId).toBe('c1')

    page.onGoPublish()
    expect(wx.navigateTo.mock.calls[0][0].url).toBe('/pages/publish/publish?content_id=c1')
  })

  it('多文件各建一个作品 → 用第一个成功文件的 content_id（现状，见文件头注释）', async () => {
    stubSeq([SIGN_OK, PUT_OK, doneOk('c1'), SIGN_OK, PUT_OK, doneOk('c2')])
    await page.run([FILE, Object.assign({}, FILE, { tempFilePath: '/tmp/b.jpg' })], 'image')
    expect(page.data.publishContentId).toBe('c1')
  })

  it('第一个文件挂了 → 用后面第一个传成的，不能因为头一个失败就没入口', async () => {
    stubSeq([SIGN_FAIL, SIGN_OK, PUT_OK, doneOk('c2')])
    await page.run([FILE, Object.assign({}, FILE, { tempFilePath: '/tmp/b.jpg' })], 'image')
    expect(page.data.publishContentId).toBe('c2')
  })

  it('全挂了 → 没有 content_id，不能出一个跳到空作品的按钮', async () => {
    stubSeq([SIGN_FAIL])
    await page.run([FILE], 'image')
    expect(page.data.publishContentId).toBe('')
  })
})
