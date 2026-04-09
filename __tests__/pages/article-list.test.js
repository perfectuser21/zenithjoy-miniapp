/**
 * article-list 页面单元测试
 * 验证分页逻辑、数据加载、错误处理
 */

// require 触发 Page() 注册，捕获到 global.__lastPage
require('../../miniprogram/pages/article-list/article-list')
const articleListConfig = global.__getLastPage()

describe('article-list 页面', () => {
  let page

  beforeEach(() => {
    jest.clearAllMocks()
    page = {
      ...articleListConfig,
      data: {
        articles: [],
        isLoading: true,
        hasMore: true,
        page: 1,
        pageSize: 10
      },
      setData(updates) {
        Object.assign(this.data, updates)
      }
    }
  })

  describe('初始数据', () => {
    it('hasMore 默认为 true', () => {
      expect(articleListConfig.data.hasMore).toBe(true)
    })

    it('page 默认为 1', () => {
      expect(articleListConfig.data.page).toBe(1)
    })

    it('pageSize 默认为 10', () => {
      expect(articleListConfig.data.pageSize).toBe(10)
    })
  })

  describe('loadArticles', () => {
    it('成功加载文章后更新 articles', async () => {
      const mockArticles = [
        { id: '1', title: '文章1', url: 'https://example.com/1' },
        { id: '2', title: '文章2', url: 'https://example.com/2' }
      ]
      wx.cloud.callFunction.mockResolvedValueOnce({
        result: { success: true, data: mockArticles }
      })

      await page.loadArticles.call(page)

      expect(page.data.articles).toEqual(mockArticles)
      expect(page.data.isLoading).toBe(false)
    })

    it('文章数量 < pageSize 时 hasMore 为 false', async () => {
      wx.cloud.callFunction.mockResolvedValueOnce({
        result: { success: true, data: [{ id: '1', title: '文章1' }] }
      })

      await page.loadArticles.call(page)

      expect(page.data.hasMore).toBe(false)
    })

    it('文章数量 === pageSize 时 hasMore 为 true', async () => {
      const fullPage = Array.from({ length: 10 }, (_, i) => ({ id: String(i) }))
      wx.cloud.callFunction.mockResolvedValueOnce({
        result: { success: true, data: fullPage }
      })

      await page.loadArticles.call(page)

      expect(page.data.hasMore).toBe(true)
    })

    it('追加模式下合并旧数据', async () => {
      page.data.articles = [{ id: '0', title: '旧文章' }]
      wx.cloud.callFunction.mockResolvedValueOnce({
        result: { success: true, data: [{ id: '1', title: '新文章' }] }
      })

      await page.loadArticles.call(page, true)

      expect(page.data.articles).toHaveLength(2)
      expect(page.data.articles[0].id).toBe('0')
      expect(page.data.articles[1].id).toBe('1')
    })

    it('云函数失败时显示 Toast 并停止 loading', async () => {
      wx.cloud.callFunction.mockRejectedValueOnce(new Error('网络错误'))

      await page.loadArticles.call(page)

      expect(page.data.isLoading).toBe(false)
      expect(wx.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringContaining('失败') })
      )
    })

    it('result.success=false 时 hasMore 为 false', async () => {
      wx.cloud.callFunction.mockResolvedValueOnce({
        result: { success: false }
      })

      await page.loadArticles.call(page)

      expect(page.data.hasMore).toBe(false)
      expect(page.data.isLoading).toBe(false)
    })
  })

  describe('onReachBottom', () => {
    it('hasMore=false 时不加载更多', () => {
      page.data.hasMore = false
      page.loadArticles = jest.fn()

      page.onReachBottom.call(page)

      expect(page.loadArticles).not.toHaveBeenCalled()
    })

    it('isLoading=true 时不加载更多', () => {
      page.data.isLoading = true
      page.loadArticles = jest.fn()

      page.onReachBottom.call(page)

      expect(page.loadArticles).not.toHaveBeenCalled()
    })

    it('条件满足时 page+1 并调用 loadArticles', () => {
      page.data.hasMore = true
      page.data.isLoading = false
      page.data.page = 1
      page.loadArticles = jest.fn()

      page.onReachBottom.call(page)

      expect(page.data.page).toBe(2)
      expect(page.loadArticles).toHaveBeenCalledWith(true)
    })
  })

  describe('goToDetail', () => {
    it('有 url 时跳转到 web-view', () => {
      const e = { currentTarget: { dataset: { url: 'https://example.com', id: null } } }
      page.goToDetail.call(page, e)

      expect(wx.navigateTo).toHaveBeenCalledWith(
        expect.objectContaining({ url: expect.stringContaining('web-view') })
      )
    })

    it('有 id 无 url 时跳转到 article-detail', () => {
      const e = { currentTarget: { dataset: { url: null, id: 'abc123' } } }
      page.goToDetail.call(page, e)

      expect(wx.navigateTo).toHaveBeenCalledWith(
        expect.objectContaining({ url: expect.stringContaining('article-detail') })
      )
    })
  })
})
