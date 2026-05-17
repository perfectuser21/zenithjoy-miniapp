/**
 * article-detail 页面单元测试
 * 验证文章加载、导航逻辑
 */

require('../../miniprogram/pages/article-detail/article-detail')
const articleDetailConfig = global.__getLastPage()

describe('article-detail 页面', () => {
  let page

  beforeEach(() => {
    jest.clearAllMocks()
    wx.redirectTo = jest.fn()
    page = {
      ...articleDetailConfig,
      data: {
        article: null,
        isLoading: true,
        error: null
      },
      setData(updates) {
        Object.assign(this.data, updates)
      }
    }
  })

  describe('初始数据', () => {
    it('article 默认为 null', () => {
      expect(articleDetailConfig.data.article).toBeNull()
    })

    it('isLoading 默认为 true', () => {
      expect(articleDetailConfig.data.isLoading).toBe(true)
    })

    it('error 默认为 null', () => {
      expect(articleDetailConfig.data.error).toBeNull()
    })
  })

  describe('onLoad', () => {
    it('有 id 时调用云函数获取文章', () => {
      wx.cloud.callFunction.mockResolvedValueOnce({
        result: { success: true, data: { id: '1', title: '测试文章' } }
      })
      page.onLoad.call(page, { id: 'test-id' })
      expect(wx.cloud.callFunction).toHaveBeenCalled()
    })

    it('有 url 时 redirectTo web-view', () => {
      page.onLoad.call(page, { url: encodeURIComponent('https://example.com') })
      expect(wx.redirectTo).toHaveBeenCalledWith(
        expect.objectContaining({ url: expect.stringContaining('web-view') })
      )
    })

    it('无 id 无 url 时进入默认预览内容', () => {
      page.onLoad.call(page, {})
      expect(page.data.error).toBeNull()
      expect(page.data.isLoading).toBe(false)
      expect(page.data.article).toBeTruthy()
    })
  })
})
