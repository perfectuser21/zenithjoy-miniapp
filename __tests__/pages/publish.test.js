/**
 * 发布页 —— 上传完的作品在这里改标题/文案、勾平台、一键进发布队列。
 *
 * 界面这一侧要保证四件事：
 *   ① 进页先把作品找出来预填——找不到要说清楚，不能给一张空表单让人白填
 *   ② 一个平台都没勾不许发，本地就拦住，不浪费一个请求
 *   ③ 发布是两步（先 PATCH 存内容，再 publish 进队列），哪一步失败提示
 *      必须不一样：PATCH 失败=还没进队列可重试；publish 失败=草稿已保存
 *   ④ 成功要说人话（进了队列、回执去哪看）然后送人回去
 */

const PAGE = '../../miniprogram/pages/publish/publish.js'

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

const CONTENT = {
  id: 'c1',
  title: '十一月的湖',
  body: '湖边走了一圈',
  type: 'image',
  platforms: ['douyin'],
  status: 'draft',
  preview_url: 'https://x/p.jpg',
  receipts: []
}

const LIST_OK = { statusCode: 200, data: { success: true, data: { items: [CONTENT] } } }
const PATCH_OK = { statusCode: 200, data: { success: true, data: CONTENT } }
const PUBLISH_OK = { statusCode: 200, data: { success: true, data: { id: 'c1', status: 'queued' } } }

const flush = () => new Promise((r) => setTimeout(r, 5))

/** 进页 + 等 listContents 回来，返回预填好的页面 */
async function openWith(steps) {
  stubSeq(steps)
  page = loadPage()
  page.onLoad({ content_id: 'c1' })
  await flush()
  return page
}

function pickedKeys(p) {
  return p.data.platforms.filter((x) => x.checked).map((x) => x.key)
}

beforeEach(() => {
  global.wx.getStorageSync = jest.fn(() => 'ZJ-F-TESTKEY')
  global.wx.getAccountInfoSync = jest.fn(() => ({ miniProgram: { envVersion: 'trial' } }))
  global.wx.showToast = jest.fn()
  global.wx.showModal = jest.fn((opts) => setTimeout(() => {
    if (typeof opts.success === 'function') opts.success({ confirm: true })
  }, 0))
  global.wx.navigateBack = jest.fn()
})

describe('进页预填', () => {
  it('按 content_id 找到作品 → 预填标题/文案/缩略图/已选平台', async () => {
    await openWith([LIST_OK])
    expect(page.data.loading).toBe(false)
    expect(page.data.title).toBe('十一月的湖')
    expect(page.data.body).toBe('湖边走了一圈')
    expect(page.data.previewUrl).toBe('https://x/p.jpg')
    expect(pickedKeys(page)).toEqual(['douyin'])
  })

  it('九个平台一个不少，作品没选过的默认不勾', async () => {
    await openWith([LIST_OK])
    expect(page.data.platforms.map((x) => x.key).sort()).toEqual(
      ['bilibili', 'douyin', 'kuaishou', 'shipinhao', 'toutiao', 'wechat', 'weibo', 'xiaohongshu', 'zhihu']
    )
  })

  it('列表里找不到这个 id → 说清楚，不给空表单让人白填', async () => {
    await openWith([{ statusCode: 200, data: { success: true, data: { items: [] } } }])
    expect(page.data.errorMessage).toContain('找不到')
  })

  it('没带 content_id 进来 → 直接报错，一个请求都不发', async () => {
    stubSeq([])
    page = loadPage()
    page.onLoad({})
    await flush()
    expect(page.data.errorMessage).toBeTruthy()
    expect(wx.request).not.toHaveBeenCalled()
  })

  it('没填凭据 → needToken，界面能送人去「我的」', async () => {
    global.wx.getStorageSync = jest.fn(() => '')
    await openWith([])
    expect(page.data.needToken).toBe(true)
  })
})

describe('平台勾选', () => {
  it('点一下勾上，再点一下取消', async () => {
    await openWith([LIST_OK])
    page.onTogglePlatform({ currentTarget: { dataset: { key: 'weibo' } } })
    expect(pickedKeys(page).sort()).toEqual(['douyin', 'weibo'])
    page.onTogglePlatform({ currentTarget: { dataset: { key: 'weibo' } } })
    expect(pickedKeys(page)).toEqual(['douyin'])
  })
})

describe('发布两步走', () => {
  it('一个平台都没勾 → 本地拦住，不发任何请求', async () => {
    const content = Object.assign({}, CONTENT, { platforms: [] })
    await openWith([{ statusCode: 200, data: { success: true, data: { items: [content] } } }])
    await page.onPublish()
    expect(wx.request).toHaveBeenCalledTimes(1)   // 只有进页那次 list
    expect(wx.showToast.mock.calls[0][0].title).toContain('平台')
  })

  it('先 PATCH 存内容再 publish 进队列，顺序不能反', async () => {
    await openWith([LIST_OK, PATCH_OK, PUBLISH_OK])
    page.onTitleInput({ detail: { value: '新标题' } })
    page.onBodyInput({ detail: { value: '新文案' } })
    page.onTogglePlatform({ currentTarget: { dataset: { key: 'xiaohongshu' } } })
    await page.onPublish()
    await flush()

    const patch = wx.request.mock.calls[1][0]
    expect(patch.method).toBe('PATCH')
    expect(patch.url).toContain('/api/contents/c1')
    expect(patch.data.title).toBe('新标题')
    expect(patch.data.body).toBe('新文案')
    expect(patch.data.platforms.sort()).toEqual(['douyin', 'xiaohongshu'])

    const pub = wx.request.mock.calls[2][0]
    expect(pub.method).toBe('POST')
    expect(pub.url).toContain('/api/contents/c1/publish')
  })

  it('成功 → 提示进了队列 + 回执去作品列表看，然后送人回去', async () => {
    await openWith([LIST_OK, PATCH_OK, PUBLISH_OK])
    await page.onPublish()
    await flush()
    const modal = wx.showModal.mock.calls[0][0]
    expect(modal.content).toContain('发布队列')
    expect(modal.content).toContain('回执')
    expect(wx.navigateBack).toHaveBeenCalled()
  })

  it('PATCH 失败 → 提示还没进队列可重试，且绝不去调 publish', async () => {
    await openWith([LIST_OK, { statusCode: 500, data: { success: false, error: { message: '写库失败' } } }])
    await page.onPublish()
    await flush()
    expect(wx.request).toHaveBeenCalledTimes(2)   // list + patch，没有 publish
    const modal = wx.showModal.mock.calls[0][0]
    expect(modal.title + modal.content).toContain('重试')
    expect(modal.content).toContain('写库失败')
    expect(wx.navigateBack).not.toHaveBeenCalled()
  })

  it('PATCH 撞上 409 EDIT_LOCKED → 人话原样带出（作品已在发布队列，不能再改）', async () => {
    await openWith([LIST_OK, { statusCode: 409, data: { success: false, error: { code: 'EDIT_LOCKED', message: 'locked' } } }])
    await page.onPublish()
    await flush()
    const modal = wx.showModal.mock.calls[0][0]
    expect(modal.content).toContain('作品已在发布队列，不能再改')
  })

  it('publish 失败 → 提示草稿已保存，和 PATCH 失败的提示不能是同一句', async () => {
    await openWith([LIST_OK, PATCH_OK,
      { statusCode: 409, data: { success: false, error: { code: 'NoActiveAgent', message: 'no active agent' } } }])
    await page.onPublish()
    await flush()
    const modal = wx.showModal.mock.calls[0][0]
    expect(modal.title + modal.content).toContain('草稿')
    expect(modal.content).toContain('发布手机不在线')
    expect(wx.navigateBack).not.toHaveBeenCalled()
  })
})
