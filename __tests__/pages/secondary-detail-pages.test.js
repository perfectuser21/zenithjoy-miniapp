describe('secondary detail pages pencil defaults', () => {
  const fs = require('fs');
  const path = require('path');

  beforeEach(() => {
    jest.resetModules();
    global.__resetPage();
  });

  test('title generate exposes pencil-aligned hero copy', () => {
    jest.doMock('../../miniprogram/utils/creator-studio', () => ({
      addTitleResultsToLibrary: jest.fn(),
      buildTitleResults: jest.fn(() => []),
      getSourceContext: jest.fn(() => ({
        articleContent: '很多人不是不够努力，而是方向从一开始就拧了。'
      })),
      saveTitleResults: jest.fn()
    }));

    require('../../miniprogram/pages/copywriter/title-generate/title-generate.js');
    const page = global.__getLastPage();
    page.setData = (patch) => {
      page.data = { ...page.data, ...patch };
    };

    page.onShow();

    expect(page.data.heroCard.title).toBe('围绕现有内容，快速筛出更想点开的标题');
    expect(page.data.heroCard.description).toContain('支持切换风格');
  });

  test('title library exposes pencil-aligned hero copy', () => {
    jest.doMock('../../miniprogram/utils/creator-studio', () => ({
      getFinalTitle: jest.fn(() => null),
      getTitleLibrary: jest.fn(() => []),
      removeTitleLibraryItem: jest.fn(),
      toggleTitleLibraryStatus: jest.fn()
    }));

    require('../../miniprogram/pages/copywriter/title-library/title-library.js');
    const page = global.__getLastPage();
    page.setData = (patch) => {
      page.data = { ...page.data, ...patch };
    };

    page.onShow();

    expect(page.data.heroCard.title).toBe('把想保留的标题先收进这里，再集中比较和确认');
    expect(page.data.heroCard.description).toContain('支持按状态查看');
  });

  test('ranking detail exposes pencil-aligned hero copy', () => {
    require('../../miniprogram/pages/ranking/detail/detail.js');
    const page = global.__getLastPage();

    expect(page.data.heroTitle).toContain('追踪今天最值得跟进');
    expect(page.data.metrics).toHaveLength(3);
    expect(page.data.filters).toHaveLength(3);
    expect(page.data.rankingItems).toHaveLength(7);
  });

  test('ranking detail matches pencil typography and spacing', () => {
    const wxmlPath = path.resolve(__dirname, '../../miniprogram/pages/ranking/detail/detail.wxml');
    const wxml = fs.readFileSync(wxmlPath, 'utf8');
    const wxssPath = path.resolve(__dirname, '../../miniprogram/pages/ranking/detail/detail.wxss');
    const wxss = fs.readFileSync(wxssPath, 'utf8');

    expect(wxml).toContain('padding-top: {{statusBarHeight + 3}}px;');
    expect(wxml).not.toContain('class="ranking-code"');
    expect(wxml).toContain('show-scrollbar="true"');
    expect(wxml).not.toContain('class="ranking-list-track"');
    expect(wxml).toContain('class="ranking-card-title">{{topListTitle}}</view>');
    expect(wxml).not.toContain('榜单使用建议');
    expect(wxml).not.toContain('class="ranking-footer-fixed"');
    expect(wxml).not.toContain('查看完整榜单');
    expect(wxml).not.toContain('class="ranking-row-link"');

    expect(wxss).toContain('.ranking-hero-title {\n  font-size: 38rpx;');
    expect(wxss).toContain('.ranking-card-title {\n  font-size: 31rpx;');
    expect(wxss).toContain('.ranking-row-title {\n  font-size: 25rpx;');
    expect(wxss).not.toContain('.ranking-row-meta');
    expect(wxss).toContain('.ranking-list {\n  max-height: 778rpx;');
  });

  test('reading detail exposes pencil-aligned hero copy', () => {
    require('../../miniprogram/pages/reading-list/detail/detail.js');
    const page = global.__getLastPage();

    expect(page.data.heroCard.title).toBe('自媒体前沿创作集');
    expect(page.data.heroCard.description).toContain('把值得反复研究的创作方法整理成一份今日精选');
    expect(page.data.heroMetaChips).toHaveLength(2);
    expect(page.data.categoryChips).toHaveLength(4);
    expect(page.data.readingItems).toHaveLength(6);
    expect(page.data.readingItems[0].articleId).toBe('reading-02');
  });

  test('reading detail matches latest list layout and route target page', () => {
    const wxmlPath = path.resolve(__dirname, '../../miniprogram/pages/reading-list/detail/detail.wxml');
    const wxml = fs.readFileSync(wxmlPath, 'utf8');
    const wxssPath = path.resolve(__dirname, '../../miniprogram/pages/reading-list/detail/detail.wxss');
    const wxss = fs.readFileSync(wxssPath, 'utf8');

    expect(wxml).toContain('class="reading-hero-eyebrow">{{heroEyebrow}}</view>');
    expect(wxml).toContain('class="reading-featured-card" bindtap="openArticleRead"');
    expect(wxml).toContain('class="reading-list-title">继续阅读</view>');
    expect(wxml).toContain('class="reading-list-hint">滑动可看更多</view>');
    expect(wxml).toContain('class="reading-item-action" bindtap="openArticleRead" data-article-id="{{item.articleId}}">查看</view>');
    expect(wxml).toContain('<scroll-view class="reading-list-scroll" scroll-y="true" show-scrollbar="true">');
    expect(wxml).not.toContain('class="reading-scroll-track"');
    expect(wxml).not.toContain('class="floating-label"');
    expect(wxml).not.toContain('打开完整合集');

    expect(wxss).toContain('.reading-page {\n  min-height: 100vh;');
    expect(wxss).toContain('.reading-hero-title {\n  font-size: 40rpx;');
    expect(wxss).toContain('.reading-featured-title {\n  font-size: 27rpx;');
    expect(wxss).toContain('.reading-featured-card-title {\n  font-size: 31rpx;');
    expect(wxss).toContain('.reading-category-chip {\n  padding: 0 14rpx;\n  border-radius: 999rpx;\n  background: #eff2ff;\n  color: #5d67c6;\n  font-size: 27rpx;');
    expect(wxss).toContain('.reading-item-title {\n  font-size: 27rpx;');
    expect(wxss).toContain('.reading-list-card {\n  border-radius: 38rpx;');
    expect(wxss).toContain('.reading-list-wrap {\n  position: relative;\n  width: 100%;\n  flex: 1;');
    expect(wxss).toContain('.reading-list-scroll {\n  height: 100%;');
  });
});
