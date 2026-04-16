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
    expect(page.data.visibleResults).toHaveLength(3);
    expect(page.data.activeResultId).toBe('t1');
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
  });

  test('title page styles use fixed bottom bars and centered labels', () => {
    const generateWxss = fs.readFileSync(
      path.resolve(__dirname, '../../miniprogram/pages/copywriter/title-generate/title-generate.wxss'),
      'utf8'
    );
    const libraryWxss = fs.readFileSync(
      path.resolve(__dirname, '../../miniprogram/pages/copywriter/title-library/title-library.wxss'),
      'utf8'
    );

    expect(generateWxss).toContain('.bottom-actions {\n  position: fixed;');
    expect(generateWxss).toContain('line-height: 81rpx;');
    expect(generateWxss).toContain('text-align: center;');
    expect(generateWxss).toContain('.result-track {');
    expect(generateWxss).not.toContain('.result-scroll');
    expect(libraryWxss).toContain('.bottom-actions {\n  position: fixed;');
    expect(libraryWxss).toContain('line-height: 81rpx;');
    expect(libraryWxss).toContain('text-align: center;');
  });
});
