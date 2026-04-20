const fs = require('fs')
const path = require('path')

describe('moments pages pencil defaults', () => {
  beforeEach(() => {
    jest.resetModules()
    global.__resetPage()
    wx.navigateTo.mockClear()
    wx.navigateBack.mockClear()
    wx.switchTab.mockClear()
    wx.redirectTo.mockClear()
  })

  test('moments generate falls back to pencil-aligned source copy', () => {
    jest.doMock('../../miniprogram/utils/creator-studio', () => ({
      buildMomentsDrafts: jest.fn(() => []),
      getLastMomentsDrafts: jest.fn(() => []),
      getSourceContext: jest.fn(() => null),
      saveMomentsDrafts: jest.fn()
    }))

    require('../../miniprogram/pages/copywriter/moments-generate/moments-generate.js')
    const page = global.__getLastPage()
    page.setData = (patch) => {
      page.data = { ...page.data, ...patch }
    }
    page.onShow()

    expect(page.data.sourceContext.articleContent).toContain('很多人以为')
    expect(page.data.sourceContext.articleContent).toBe('很多人以为，只要更努力地写，就会慢慢找到自己的节奏。')
    expect(page.data.heroCard.title).toBe('基于现有内容，快速生成更适合朋友圈发布的表达版本')
    expect(page.data.variantRows[0][0].text).toBe('认知教育类')
    expect(page.data.sourceMeta).toBe('当前文案想法')
    expect(page.data.selectedVariant).toBe('认知教育类')
    expect(page.data.selectedAngle).toBe('场景开场')
  })

  test('moments generate switches selected chips for tappable groups', () => {
    jest.doMock('../../miniprogram/utils/creator-studio', () => ({
      buildMomentsDrafts: jest.fn(() => []),
      getLastMomentsDrafts: jest.fn(() => []),
      getSourceContext: jest.fn(() => null),
      saveMomentsDrafts: jest.fn()
    }))

    require('../../miniprogram/pages/copywriter/moments-generate/moments-generate.js')
    const page = global.__getLastPage()
    page.setData = (patch) => {
      page.data = { ...page.data, ...patch }
    }

    page.selectVariant({ currentTarget: { dataset: { id: 'variant-daily', value: '日常真实类' } } })
    page.selectAngle({ currentTarget: { dataset: { id: 'angle-list', value: '清单条列' } } })
    expect(page.data.selectedVariant).toBe('日常真实类')
    expect(page.data.selectedAngle).toBe('清单条列')
  })

  test('moments generate template matches latest pencil structure', () => {
    const template = fs.readFileSync(
      path.join(__dirname, '../../miniprogram/pages/copywriter/moments-generate/moments-generate.wxml'),
      'utf8'
    )
    const styles = fs.readFileSync(
      path.join(__dirname, '../../miniprogram/pages/copywriter/moments-generate/moments-generate.wxss'),
      'utf8'
    )

    expect(template).not.toContain('14 朋友圈文案生成')
    expect(template).not.toContain('section-meta">source<')
    expect(template).not.toContain('section-meta">angle<')
    expect(template).not.toContain('section-meta">strategy<')
    expect(template).toContain('<textarea')
    expect(template).toContain('</textarea>')
    expect(template).toContain('bindinput="handleSourceInput"')
    expect(template).toContain('bindtap="selectVariant"')
    expect(template).toContain('bindtap="selectAngle"')
    expect(template).not.toContain('bindtap="selectStrategy"')
    expect(template).not.toContain('strategy-card')
    expect(styles).not.toContain('.studio-page {\n  height: 100vh;\n  padding: 24rpx 38rpx calc(164rpx + env(safe-area-inset-bottom));\n  background: linear-gradient(180deg, #f7faff 0%, #eef4ff 100%);\n  box-sizing: border-box;\n  overflow: hidden;')
    expect(styles).not.toContain('position: fixed;')
    expect(styles).toContain('.source-input')
    expect(styles).toContain('height: 286rpx;')
    expect(styles).toContain('height: 176rpx;')
    expect(styles).toContain('font-size: 27rpx;')
    expect(styles).toContain('height: 92rpx;')
    expect(styles).not.toContain('.strategy-card')
    expect(styles).toContain('height: 472rpx;')
    expect(styles).toContain('display: flex;')
  })

  test('moments generate updates editable source text', () => {
    jest.doMock('../../miniprogram/utils/creator-studio', () => ({
      buildMomentsDrafts: jest.fn(() => []),
      getLastMomentsDrafts: jest.fn(() => []),
      getSourceContext: jest.fn(() => null),
      saveMomentsDrafts: jest.fn()
    }))

    require('../../miniprogram/pages/copywriter/moments-generate/moments-generate.js')
    const page = global.__getLastPage()
    page.setData = (patch) => {
      page.data = { ...page.data, ...patch }
    }

    page.handleSourceInput({ detail: { value: '新的朋友圈文案内容' } })

    expect(page.data.sourceContext.articleContent).toBe('新的朋友圈文案内容')
  })

  test('moments generate opens editor page directly for final drafting', () => {
    jest.doMock('../../miniprogram/utils/creator-studio', () => ({
      buildMomentsDrafts: jest.fn(() => [
        { id: 'draft-1', content: '第一条文案', meta: '优势：开头抓人 + 结构完整 + 生活化表达' },
        { id: 'draft-2', content: '第二条文案', meta: '优势：观点先行，逻辑递进清楚，适合建立专业感' }
      ]),
      getLastMomentsDrafts: jest.fn(() => []),
      getSourceContext: jest.fn(() => ({ articleContent: '初始文案' })),
      saveMomentsDrafts: jest.fn()
    }))

    require('../../miniprogram/pages/copywriter/moments-generate/moments-generate.js')
    const page = global.__getLastPage()
    page.setData = (patch) => {
      page.data = { ...page.data, ...patch }
    }

    page.onShow()
    page.openPreviewPage()

    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: '/pages/copywriter/moments-editor/moments-editor?draftId=draft-1'
    })
  })

  test('moments editor falls back to pencil-aligned preview content', () => {
    jest.doMock('../../miniprogram/utils/creator-studio', () => ({
      buildMomentsDrafts: jest.fn(() => []),
      getLastMomentsDrafts: jest.fn(() => []),
      getSourceContext: jest.fn(() => null),
      saveMomentsDrafts: jest.fn()
    }))

    require('../../miniprogram/pages/copywriter/moments-editor/moments-editor.js')
    const page = global.__getLastPage()
    page.setData = (patch) => {
      page.data = { ...page.data, ...patch }
    }
    page.onShow()

    expect(page.data.heroCard.kicker).toBe('下一步：定稿')
    expect(page.data.heroCard.title).toBe('选文案，再精修定稿')
    expect(page.data.heroCard.description).toBe('点击列表切换，编辑区即时改写。')
    expect(page.data.previewTitle).toBe('文案列表')
    expect(page.data.previewMeta).toBe('点击卡片切换，查看每条优势')
    expect(page.data.editorTitle).toBe('选中文案（可编辑）')
    expect(page.data.editorMeta).toBe('支持粘贴、保存与复制')
    expect(page.data.selectedDraftId).toBe('fallback-moments-1')
    expect(page.data.rankedDrafts).toHaveLength(4)
    expect(page.data.rankedDrafts[0].content).toBe('最近把内容方向重新梳理了一遍，发现很多卡点都不是努力不够，而是方向和结构没先调顺。先把主线定清楚，再去写具体表达，整条文案会顺很多。')
    expect(page.data.rankedDrafts[0].meta).toBe('当前选中 · 优势：开头抓人 + 结构完整 + 生活化表达')
    expect(page.data.rankedDrafts[1].content).toBe('不是你没有素材，而是表达顺序容易乱。先说结论，再补原因，最后给一个可执行动作，读者会更容易跟上你的节奏。')
    expect(page.data.rankedDrafts[1].meta).toBe('优势：观点先行，逻辑递进清楚，适合建立专业感')
    expect(page.data.rankedDrafts[2].meta).toBe('优势：节奏稳定，长期连载友好，易形成内容系列')
    expect(page.data.rankedDrafts[3].meta).toBe('优势：口语自然，亲近感强，评论互动门槛低')
    expect(page.data.activeContent).toContain('最近把内容方向重新梳理了一遍')
    expect(page.data.guideChips).toHaveLength(0)
    expect(page.data.scrollTop).toBe(0)
    expect(page.data.rankedDrafts).toHaveLength(4)
  })

  test('moments editor ignores cached drafts and uses current pencil copy set', () => {
    jest.doMock('../../miniprogram/utils/creator-studio', () => ({
      buildMomentsDrafts: jest.fn(() => [
        { id: 'generated-1', content: '小红书起号为什么总是起不来', meta: '旧生成内容' }
      ]),
      getLastMomentsDrafts: jest.fn(() => [
        { id: 'cached-1', content: '关于小红书起号的旧缓存文案', meta: '旧缓存内容' },
        { id: 'cached-2', content: '另一条旧缓存文案', meta: '旧缓存内容' }
      ]),
      getSourceContext: jest.fn(() => null),
      saveMomentsDrafts: jest.fn()
    }))

    require('../../miniprogram/pages/copywriter/moments-editor/moments-editor.js')
    const page = global.__getLastPage()
    page.setData = (patch) => {
      page.data = { ...page.data, ...patch }
    }
    page.onShow()

    expect(page.data.rankedDrafts).toHaveLength(4)
    expect(page.data.rankedDrafts[0].content).toBe('最近把内容方向重新梳理了一遍，发现很多卡点都不是努力不够，而是方向和结构没先调顺。先把主线定清楚，再去写具体表达，整条文案会顺很多。')
    expect(page.data.rankedDrafts[1].content).toBe('不是你没有素材，而是表达顺序容易乱。先说结论，再补原因，最后给一个可执行动作，读者会更容易跟上你的节奏。')
    expect(page.data.rankedDrafts[0].content).not.toContain('小红书起号')
    expect(page.data.activeContent).toBe('最近把内容方向重新梳理了一遍，发现很多卡点都不是努力不够，而是方向和结构没先调顺。先把主线定清楚，再去写具体表达，整条文案会顺很多。')
  })

  test('moments editor pads drafts to four pencil-sized cards', () => {
    jest.doMock('../../miniprogram/utils/creator-studio', () => ({
      buildMomentsDrafts: jest.fn(() => [
        { id: 'runtime-1', content: '短文案一', meta: '优势：一' },
        { id: 'runtime-2', content: '短文案二', meta: '优势：二' }
      ]),
      getLastMomentsDrafts: jest.fn(() => []),
      getSourceContext: jest.fn(() => null),
      saveMomentsDrafts: jest.fn()
    }))

    require('../../miniprogram/pages/copywriter/moments-editor/moments-editor.js')
    const page = global.__getLastPage()
    page.setData = (patch) => {
      page.data = { ...page.data, ...patch }
    }
    page.onShow()

    expect(page.data.rankedDrafts).toHaveLength(4)
    expect(page.data.rankedDrafts[0].content).toBe('最近把内容方向重新梳理了一遍，发现很多卡点都不是努力不够，而是方向和结构没先调顺。先把主线定清楚，再去写具体表达，整条文案会顺很多。')
    expect(page.data.rankedDrafts[1].content).toBe('不是你没有素材，而是表达顺序容易乱。先说结论，再补原因，最后给一个可执行动作，读者会更容易跟上你的节奏。')
    expect(page.data.rankedDrafts[2].content).toBe('方向清晰之后，发布频率自然会稳定。你不用每次都从零开始，只要沿着同一主题持续输出，内容就会越来越有辨识度。')
    expect(page.data.rankedDrafts[3].content).toBe('很多时候写不出来，不是没想法，而是还没把要表达的重点捋清楚。先把一句核心观点写出来，再往下展开会轻松很多。')
  })

  test('moments editor keeps pencil copy set even when runtime drafts exceed four', () => {
    jest.doMock('../../miniprogram/utils/creator-studio', () => ({
      buildMomentsDrafts: jest.fn(() => [
        { id: 'runtime-1', content: '第一条很长的文案内容用于测试滚动摘要一', meta: '优势：一' },
        { id: 'runtime-2', content: '第二条很长的文案内容用于测试滚动摘要二', meta: '优势：二' },
        { id: 'runtime-3', content: '第三条很长的文案内容用于测试滚动摘要三', meta: '优势：三' },
        { id: 'runtime-4', content: '第四条很长的文案内容用于测试滚动摘要四', meta: '优势：四' },
        { id: 'runtime-5', content: '第五条很长的文案内容用于测试滚动摘要五', meta: '优势：五' },
        { id: 'runtime-6', content: '第六条很长的文案内容用于测试滚动摘要六', meta: '优势：六' }
      ]),
      getLastMomentsDrafts: jest.fn(() => []),
      getSourceContext: jest.fn(() => null),
      saveMomentsDrafts: jest.fn()
    }))

    require('../../miniprogram/pages/copywriter/moments-editor/moments-editor.js')
    const page = global.__getLastPage()
    page.setData = (patch) => {
      page.data = { ...page.data, ...patch }
    }
    page.onShow()

    expect(page.data.rankedDrafts).toHaveLength(4)
    expect(page.data.draftListStyle).toContain('translateY(-0px)')
    expect(page.data.scrollThumbStyle).toContain('translateY(0px)')
    expect(page.data.rankedDrafts[0].content).toBe('最近把内容方向重新梳理了一遍，发现很多卡点都不是努力不够，而是方向和结构没先调顺。先把主线定清楚，再去写具体表达，整条文案会顺很多。')
    expect(page.data.rankedDrafts[0].content).not.toContain('测试滚动摘要')
  })

  test('moments editor keeps full draft only in textarea after selecting card', () => {
    jest.doMock('../../miniprogram/utils/creator-studio', () => ({
      buildMomentsDrafts: jest.fn(() => []),
      getLastMomentsDrafts: jest.fn(() => []),
      getSourceContext: jest.fn(() => null),
      saveMomentsDrafts: jest.fn()
    }))

    require('../../miniprogram/pages/copywriter/moments-editor/moments-editor.js')
    const page = global.__getLastPage()
    page.setData = (patch) => {
      page.data = { ...page.data, ...patch }
    }
    page.onShow()

    page.selectDraft({ currentTarget: { dataset: { id: 'fallback-moments-2' } } })

    expect(page.data.activeContent).toBe('不是你没有素材，而是表达顺序容易乱。先说结论，再补原因，最后给一个可执行动作，读者会更容易跟上你的节奏。')
    expect(page.data.rankedDrafts[1].content).toBe('不是你没有素材，而是表达顺序容易乱。先说结论，再补原因，最后给一个可执行动作，读者会更容易跟上你的节奏。')
  })

  test('moments editor template matches latest pencil structure', () => {
    const template = fs.readFileSync(
      path.join(__dirname, '../../miniprogram/pages/copywriter/moments-editor/moments-editor.wxml'),
      'utf8'
    )
    const styles = fs.readFileSync(
      path.join(__dirname, '../../miniprogram/pages/copywriter/moments-editor/moments-editor.wxss'),
      'utf8'
    )

    expect(template).not.toContain('15 朋友圈文案精修')
    expect(template).toContain('{{previewTitle}}')
    expect(template).toContain('{{previewMeta}}')
    expect(template).toContain('{{editorTitle}}')
    expect(template).toContain('{{editorMeta}}')
    expect(template).toContain('返回上一层重新生成')
    expect(template).toContain('复制定稿')
    expect(template).not.toContain('class="guide-row"')
    expect(template).toContain('class="preview-scroll-wrap"')
    expect(template).toContain('class="draft-list"')
    expect(template).toContain('class="scroll-rail"')
    expect(template).toContain('class="scroll-thumb"')
    expect(template).not.toContain('<scroll-view')
    expect(template).not.toContain('bindscroll="handleDraftScroll"')
    expect(template).not.toContain('scroll-top="{{scrollTop}}"')
    expect(template).toContain('catchtouchstart="handleScrollThumbStart"')
    expect(template).toContain('catchtouchmove="handleScrollThumbMove"')
    expect(template).toContain('bindtap="handleScrollRailTap"')
    expect(template).toContain('style="{{draftListStyle}}"')
    expect(template).toContain('style="{{scrollThumbStyle}}"')
    expect(styles).toContain('height: 69rpx;')
    expect(styles).toContain('.panel-card-flex {\n  flex: 516;')
    expect(styles).toContain('.editor-panel {\n  flex: 171;')
    expect(styles).toContain('.preview-scroll-wrap {\n  flex: 1;')
    expect(styles).toContain('.textarea-shell {\n  flex: 1;')
    expect(styles).toContain('.hero-card {\n  display: flex;\n  flex-direction: column;')
    expect(styles).toContain('height: 173rpx;')
    expect(styles).toContain('.panel-card {\n  display: flex;\n  flex-direction: column;\n  gap: 15rpx;')
    expect(styles).toContain('.draft-list {\n  flex: 1;')
    expect(styles).toContain('overflow: hidden;')
    expect(styles).toContain('.draft-track {\n  display: flex;\n  flex-direction: column;\n  gap: 15rpx;')
    expect(styles).toContain('.draft-card {\n  flex: none;')
    expect(styles).toContain('.draft-content {\n  font-size: 27rpx;')
    expect(styles).not.toContain('-webkit-line-clamp: 2;')
    expect(styles).toContain('.draft-meta {\n  margin-top: 8rpx;')
    expect(styles).toContain('font-size: 35rpx;')
    expect(styles).toContain('font-size: 31rpx;')
    expect(styles).toContain('font-size: 27rpx;')
    expect(styles).toContain('.hero-kicker {\n  font-size: 23rpx;')
    expect(styles).toContain('.section-meta {\n  font-size: 23rpx;')
    expect(styles).toContain('.draft-meta {\n  margin-top: 8rpx;\n  font-size: 23rpx;')
    expect(styles).toContain('.scroll-rail')
    expect(styles).toContain('.scroll-thumb')
    expect(styles).not.toContain('.bottom-actions {\n  position: fixed;')
    expect(styles).not.toContain('.guide-row')
    expect(styles).not.toContain('.guide-chip-blue')
  })
})
