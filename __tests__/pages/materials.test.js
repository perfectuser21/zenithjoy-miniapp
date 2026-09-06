/**
 * 素材页 —— 看素材、删素材。
 *
 * 删是不可逆的，界面这一侧要保证三件事：
 *   ① 必须二次确认，而且确认框里写清删的是哪个文件——只写「确定删除吗」
 *      在九宫格里等于让人闭着眼睛删
 *   ② 用户点了取消就一个字节都不能动
 *   ③ 删不掉时把中台给的原因原样摆出来（比如「被已发布作品用着」），
 *      只说「删除失败」等于没说
 */

const PAGE = '../../miniprogram/pages/materials/materials.js'

let page
let modalConfirm

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

const ITEMS = [
  { id: 'm1', fileName: 'IMG_7757.jpg', sizeText: '1.4 MB', video: false, previewUrl: 'https://x/1.jpg' },
  { id: 'm2', fileName: 'IMG_7758.jpg', sizeText: '2.0 MB', video: false, previewUrl: 'https://x/2.jpg' }
]

const flush = () => new Promise((r) => setTimeout(r, 5))

beforeEach(() => {
  modalConfirm = true
  global.wx.getStorageSync = jest.fn(() => 'ZJ-F-TESTKEY')
  global.wx.getAccountInfoSync = jest.fn(() => ({ miniProgram: { envVersion: 'trial' } }))
  // 报错用的那个弹窗只是告知，没有 success 回调——mock 不能假设一定有
  global.wx.showModal = jest.fn((opts) => setTimeout(() => {
    if (typeof opts.success === 'function') opts.success({ confirm: modalConfirm })
  }, 0))
  global.wx.showLoading = jest.fn()
  global.wx.hideLoading = jest.fn()
  global.wx.showToast = jest.fn()
  global.wx.request = jest.fn((opts) => setTimeout(() => opts.success({
    statusCode: 200, data: { success: true, data: { id: 'm1', deleted: true } }
  }), 0))
  page = loadPage()
  page.setData({ items: ITEMS.slice(), loading: false })
})

describe('长按删素材', () => {
  it('确认框里要写清删的是哪个文件', async () => {
    page.onLongPressItem({ currentTarget: { dataset: { id: 'm1' } } })
    await flush()
    const opts = wx.showModal.mock.calls[0][0]
    expect(opts.content).toContain('IMG_7757.jpg')
  })

  it('点取消 → 一个请求都不发', async () => {
    modalConfirm = false
    page.onLongPressItem({ currentTarget: { dataset: { id: 'm1' } } })
    await flush()
    expect(wx.request).not.toHaveBeenCalled()
    expect(page.data.items).toHaveLength(2)
  })

  it('确认删掉 → 只把这一格从列表摘掉，不整页重刷', async () => {
    // 整页重刷会让人失去滚动位置，还要重新签一遍所有预览 URL
    page.onLongPressItem({ currentTarget: { dataset: { id: 'm1' } } })
    await flush()
    await flush()
    expect(page.data.items.map((x) => x.id)).toEqual(['m2'])
  })

  it('被已发布作品用着 → 把中台给的原因原样摆出来', async () => {
    global.wx.request = jest.fn((opts) => setTimeout(() => opts.success({
      statusCode: 409,
      data: { success: false, error: { code: 'IN_USE', message: '这条素材被「十一月的湖」(published) 用着，先处理那个作品再删' } }
    }), 0))
    page.onLongPressItem({ currentTarget: { dataset: { id: 'm1' } } })
    await flush()
    await flush()

    const last = wx.showModal.mock.calls[wx.showModal.mock.calls.length - 1][0]
    expect(last.content).toContain('十一月的湖')
    // 没删成的不能从列表里消失，否则刷新一下它又回来了，人会以为见鬼
    expect(page.data.items).toHaveLength(2)
  })

  it('长按一个不存在的 id → 什么都不做', async () => {
    page.onLongPressItem({ currentTarget: { dataset: { id: 'nope' } } })
    await flush()
    expect(wx.showModal).not.toHaveBeenCalled()
  })
})

describe('点开大图后能删 —— 长按是隐藏手势，光有它等于没有', () => {
  it('点开大图 → 有当前这张的信息，删除按钮才知道删谁', () => {
    page.onTapItem({ currentTarget: { dataset: { id: 'm1' } } })
    expect(page.data.preview.id).toBe('m1')
  })

  it('在大图里点删除 → 确认框写清是哪个文件', async () => {
    page.onTapItem({ currentTarget: { dataset: { id: 'm1' } } })
    page.onDeletePreview()
    await flush()
    const opts = wx.showModal.mock.calls[0][0]
    expect(opts.content).toContain('IMG_7757.jpg')
  })

  it('删成功 → 大图自动关掉，那一格也从列表摘掉', async () => {
    // 删完还停在已经不存在的东西的大图上，是明显的错
    page.onTapItem({ currentTarget: { dataset: { id: 'm1' } } })
    page.onDeletePreview()
    await flush()
    await flush()
    expect(page.data.preview).toBeNull()
    expect(page.data.items.map((x) => x.id)).toEqual(['m2'])
  })

  it('没点开大图时点删除 → 什么都不做，不会误删', async () => {
    page.setData({ preview: null })
    page.onDeletePreview()
    await flush()
    expect(wx.showModal).not.toHaveBeenCalled()
  })
})
