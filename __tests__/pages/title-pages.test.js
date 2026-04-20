const fs = require('fs');
const path = require('path');

describe('title pages pencil sync', () => {
  beforeEach(() => {
    jest.resetModules();
    global.__resetPage();
    wx.navigateTo.mockClear();
    wx.navigateBack.mockClear();
    wx.redirectTo.mockClear();
    wx.switchTab.mockClear();
    wx.setClipboardData = jest.fn();
  });

  test('title generate falls back to six pencil-aligned results', () => {
    jest.doMock('../../miniprogram/utils/creator-studio', () => ({
      addTitleResultsToLibrary: jest.fn(),
      buildTitleResults: jest.fn(() => [
        { id: 't1', text: '标题1', note: '说明1', status: 'locked' },
        { id: 't2', text: '标题2', note: '说明2', status: 'compare' },
        { id: 't3', text: '标题3', note: '说明3', status: 'saved' },
        { id: 't4', text: '标题4', note: '说明4', status: 'compare' },
        { id: 't5', text: '标题5', note: '说明5', status: 'compare' },
        { id: 't6', text: '标题6', note: '说明6', status: 'saved' }
      ]),
      getSourceContext: jest.fn(() => ({
        articleContent: '很多人以为，只要更努力地写，就会慢慢找到自己的节奏。'
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
    expect(page.data.results).toHaveLength(6);
    expect(page.data.visibleResults).toHaveLength(6);
    expect(page.data.activeResultId).toBe('t1');
    expect(page.data.results[1].note).toBe('说明2');
    page.handleSourceInput({ detail: { value: '新的正文内容' } });
    expect(page.data.sourceContext.articleContent).toBe('新的正文内容');
  });

  test('title library computes filter stats from items', () => {
    jest.doMock('../../miniprogram/utils/creator-studio', () => ({
      getFinalTitle: jest.fn(() => ({ text: '最终标题' })),
      getTitleLibrary: jest.fn(() => [
        { id: 'a', text: 'A', note: 'N1', status: 'locked' },
        { id: 'b', text: 'B', note: 'N2', status: 'compare' },
        { id: 'c', text: 'C', note: 'N3', status: 'saved' },
        { id: 'd', text: 'D', note: 'N4', status: 'locked' }
      ]),
      removeTitleLibraryItem: jest.fn(),
      toggleTitleLibraryStatus: jest.fn()
    }));

    require('../../miniprogram/pages/copywriter/title-library/title-library.js');
    const page = global.__getLastPage();
    page.setData = (patch) => {
      page.data = { ...page.data, ...patch };
    };
    page.onShow();

    expect(page.data.stats).toEqual({ all: 4, locked: 2, compare: 1 });
    expect(page.data.items[1].label).toBe('待比较');
    expect(page.data.items[1].actionText).toBe('确定');
  });

  test('title generate page keeps fixed footer and lets source text expand inside the card', () => {
    const generateWxml = fs.readFileSync(
      path.resolve(__dirname, '../../miniprogram/pages/copywriter/title-generate/title-generate.wxml'),
      'utf8'
    );
    const generateWxss = fs.readFileSync(
      path.resolve(__dirname, '../../miniprogram/pages/copywriter/title-generate/title-generate.wxss'),
      'utf8'
    );
    const libraryWxss = fs.readFileSync(
      path.resolve(__dirname, '../../miniprogram/pages/copywriter/title-library/title-library.wxss'),
      'utf8'
    );
    const libraryWxml = fs.readFileSync(
      path.resolve(__dirname, '../../miniprogram/pages/copywriter/title-library/title-library.wxml'),
      'utf8'
    );

    expect(generateWxss).toContain('.title-page {\n  position: relative;\n  height: 100vh;');
    expect(generateWxss).toContain('.title-stack {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  height: 100vh;');
    expect(generateWxss).toContain('.title-source-card {\n  display: flex;\n  flex-direction: column;\n  gap: 12rpx;\n  min-height: 213rpx;');
    expect(generateWxss).toContain('.section-text,\n.source-input {\n  margin-top: 0;\n  font-size: 27rpx;');
    expect(generateWxss).toContain('height: 148rpx;');
    expect(generateWxss).toContain('.inline-actions {\n  display: flex;');
    expect(generateWxss).toContain('.title-style-card {\n  display: flex;\n  flex-direction: column;\n  gap: 15rpx;');
    expect(generateWxss).toContain('.title-results-card {\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 16rpx;\n  height: 504rpx;');
    expect(generateWxss).toContain('.result-scroll {\n  height: 286rpx;');
    expect(generateWxss).toContain('.title-content {\n  display: flex;\n  flex: 1;');
    expect(generateWxss).toContain('.bottom-actions {\n  display: flex;');
    expect(generateWxss).not.toContain('.bottom-actions {\n  position: fixed;');
    expect(generateWxss).toContain('.inline-action {\n  flex: 1;\n  height: 69rpx;');
    expect(generateWxss).toContain('.btn-secondary,\n.btn-primary {\n  flex: 1;\n  height: 81rpx;');
    expect(generateWxml).toContain('<scroll-view class="result-scroll" scroll-y="true" show-scrollbar="false" scroll-top="{{resultScrollTop}}" bindscroll="handleResultScroll">');
    expect(generateWxml).toContain('<textarea');
    expect(generateWxml).toContain('bindinput="handleSourceInput"');
    expect(generateWxml).not.toContain('class="result-track"');
    expect(generateWxss).not.toContain('.result-track {');
    expect(generateWxss).not.toContain('.result-thumb {');
    expect(libraryWxss).toContain('.bottom-actions {\n  position: fixed;');
    expect(libraryWxss).toContain('line-height: 81rpx;');
    expect(libraryWxss).toContain('text-align: center;');
    expect(libraryWxss).toContain('.library-list-card {\n  flex: 1;');
    expect(libraryWxss).toContain('.library-list-card {\n  flex: 1;\n  display: flex;');
    expect(libraryWxss).toContain('flex-direction: column;');
    expect(libraryWxss).toContain('overflow: hidden;');
    expect(libraryWxss).toContain('height: 359rpx;');
    expect(libraryWxss).toContain('.library-scroll {\n  flex: 1;');
    expect(libraryWxss).toContain('min-height: 0;');
    expect(libraryWxss).not.toContain('.library-scroll {\n  height: 246rpx;');
    expect(libraryWxss).toContain('.library-track {\n  position: absolute;\n  top: 88rpx;\n  right: 18rpx;\n  width: 6rpx;\n  height: 246rpx;');
    expect(libraryWxml).not.toContain('待比较 {{stats.compare}}');
    expect(libraryWxml).not.toContain('已确认 1 条');
    expect(libraryWxml).not.toContain('final-tags');
    expect(libraryWxml).toContain('<view class="section-head">\n          <view class="section-title">最终选题</view>\n          <view class="copy-btn" bindtap="copyFinalTitle">复制标题</view>\n        </view>');
    expect(libraryWxml).not.toContain('copy-row');
  });
});
