/**
 * 「我的」页 —— 填凭据的地方。
 *
 * 2026-09-06 真机反馈：输入框里敲字看不见（深色模式下微信把原生 input 的文字
 * 渲染成浅色，叠在浅灰底上等于隐形）。修法不是去和原生组件的配色较劲，而是：
 *   ① 主路径改成「粘贴并验证」——手机上敲一串 license key 本来就不该是主路径
 *   ② 手动输入保留，但把输进去的东西用 <text> 明文回显；<text> 是自己画的，
 *      不受原生组件配色影响，一定看得见
 *   ③ 存之前先验，验不过就不存 —— 不能让人以为配好了
 */

const PAGE = '../../miniprogram/pages/user/user.js'

let storage
let page

function loadPage() {
  jest.resetModules()
  global.__resetPage()
  require(PAGE)
  const p = global.__getLastPage()
  p.setData = function (patch) {
    Object.keys(patch).forEach((k) => { p.data[k] = patch[k] })
  }
  p.data = Object.assign({}, p.data)
  return p
}

beforeEach(() => {
  storage = {}
  wx.getStorageSync = jest.fn((k) => storage[k])
  wx.setStorageSync = jest.fn((k, v) => { storage[k] = v })
  wx.removeStorageSync = jest.fn((k) => { delete storage[k] })
  wx.getAccountInfoSync = jest.fn(() => ({ miniProgram: { envVersion: 'trial' } }))
  wx.request = jest.fn((opts) => setTimeout(() => opts.success({
    statusCode: 200, data: { success: true, data: { items: [], total: 3 } }
  }), 0))
  wx.getClipboardData = jest.fn((opts) => setTimeout(() => opts.success({ data: '  ZJ-F-PASTED  ' }), 0))
  wx.showToast = jest.fn()
  wx.showModal = jest.fn()
  page = loadPage()
})

/** 等 Promise 链跑完 */
const flush = () => new Promise((r) => setTimeout(r, 5))

describe('看得见自己输了什么', () => {
  it('输入时明文回显 —— 原生输入框看不见也不影响', async () => {
    page.onInput({ detail: { value: 'ZJ-F-ABC12' } })
    expect(page.data.echo).toBe('ZJ-F-ABC12')
  })

  it('没输东西时不显示回显行，别摆一个空框子', () => {
    page.onInput({ detail: { value: '' } })
    expect(page.data.echo).toBe('')
  })
})

describe('粘贴并验证 —— 手机上的主路径', () => {
  it('从剪贴板拿到凭据，去掉前后空格，验过才算数', async () => {
    await page.onPaste()
    await flush()
    expect(storage.zj_upload_token).toBe('ZJ-F-PASTED')   // 复制时常带空格
    expect(page.data.checkResult).toContain('✅')
  })

  it('剪贴板是空的 → 提示，不去打中台', async () => {
    wx.getClipboardData = jest.fn((opts) => setTimeout(() => opts.success({ data: '   ' }), 0))
    await page.onPaste()
    await flush()
    expect(wx.request).not.toHaveBeenCalled()
    expect(storage.zj_upload_token).toBeUndefined()
  })
})

describe('存之前先验', () => {
  it('验过 → 存下来，并说清楚库里有多少条', async () => {
    page.onInput({ detail: { value: 'ZJ-F-GOOD' } })
    await page.onSave()
    await flush()
    expect(storage.zj_upload_token).toBe('ZJ-F-GOOD')
    expect(page.data.checkResult).toContain('3')
  })

  it('验不过 → 把刚存的清掉，不能留个坏凭据让人以为配好了', async () => {
    wx.request = jest.fn((opts) => setTimeout(() => opts.success({ statusCode: 401, data: {} }), 0))
    page.onInput({ detail: { value: 'ZJ-F-BAD' } })
    await page.onSave()
    await flush()
    expect(storage.zj_upload_token).toBeFalsy()
    expect(page.data.saved).toBe('')
    expect(page.data.checkResult).toContain('❌')
  })

  it('什么都没填就点保存 → 提示，不去打中台', async () => {
    await page.onSave()
    await flush()
    expect(wx.request).not.toHaveBeenCalled()
  })

  it('验过之后回显要清掉 —— 凭据别一直明文摆在屏幕上', async () => {
    page.onInput({ detail: { value: 'ZJ-F-GOOD' } })
    await page.onSave()
    await flush()
    expect(page.data.echo).toBe('')
  })
})

describe('已存的凭据显示', () => {
  it('打码显示，截图发给别人不至于把凭据一起发出去', () => {
    storage.zj_upload_token = 'ZJ-F-UP5B6R5Z'
    page.onShow()
    expect(page.data.saved).toContain('····')
    expect(page.data.saved).not.toBe('ZJ-F-UP5B6R5Z')
  })
})
