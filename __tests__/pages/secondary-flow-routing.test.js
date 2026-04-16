describe('secondary flow routing', () => {
  beforeEach(() => {
    jest.resetModules();
    global.__resetPage();
    wx.navigateBack.mockClear();
    wx.navigateTo.mockClear();
    wx.redirectTo.mockClear();
    wx.switchTab.mockClear();
    global.getCurrentPages.mockReturnValue([{}]);
  });

  test('title generate goBack falls back to workflow tab when no stack', () => {
    require('../../miniprogram/pages/copywriter/title-generate/title-generate.js');
    const page = global.__getLastPage();

    global.getCurrentPages.mockReturnValue([{}]);
    page.goBack();

    expect(wx.switchTab).toHaveBeenCalledWith({ url: '/pages/ai-features/index' });
  });

  test('title library continueAdd falls back to title generate when no stack', () => {
    require('../../miniprogram/pages/copywriter/title-library/title-library.js');
    const page = global.__getLastPage();

    global.getCurrentPages.mockReturnValue([{}]);
    page.continueAdd();

    expect(wx.redirectTo).toHaveBeenCalledWith({ url: '/pages/copywriter/title-generate/title-generate' });
  });

  test('moments preview toolbar returns to generate page with fallback', () => {
    require('../../miniprogram/pages/copywriter/moments-preview/moments-preview.js');
    const page = global.__getLastPage();

    global.getCurrentPages.mockReturnValue([{}]);
    page.goBackToGenerate();

    expect(wx.redirectTo).toHaveBeenCalledWith({ url: '/pages/copywriter/moments-generate/moments-generate' });
  });

  test('ranking detail goBack falls back to home tab when no stack', () => {
    require('../../miniprogram/pages/ranking/detail/detail.js');
    const page = global.__getLastPage();

    global.getCurrentPages.mockReturnValue([{}]);
    page.goBack();

    expect(wx.switchTab).toHaveBeenCalledWith({ url: '/pages/index/index' });
  });

  test('reading detail goBack falls back to home tab when no stack', () => {
    require('../../miniprogram/pages/reading-list/detail/detail.js');
    const page = global.__getLastPage();

    global.getCurrentPages.mockReturnValue([{}]);
    page.goBack();

    expect(wx.switchTab).toHaveBeenCalledWith({ url: '/pages/index/index' });
  });

  test('reading detail 查看 jumps to page 20 article detail', () => {
    require('../../miniprogram/pages/reading-list/detail/detail.js');
    const page = global.__getLastPage();

    page.openArticleRead({ currentTarget: { dataset: { articleId: 'reading-02' } } });

    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/article-detail/article-detail' });
  });
});
