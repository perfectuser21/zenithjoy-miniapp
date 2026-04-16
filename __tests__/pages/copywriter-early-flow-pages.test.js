const {
  clearSession,
  createSession,
  updateStepData
} = require('../../miniprogram/utils/copywriter-session');

describe('copywriter early flow pencil defaults', () => {
  beforeEach(() => {
    jest.resetModules();
    global.__resetPage();
  });

  afterEach(() => {
    clearSession();
  });

  test('start page exposes pencil-aligned hero copy', () => {
    require('../../miniprogram/pages/copywriter/start/start.js');
    const page = global.__getLastPage();

    expect(page.data.heroCard.title).toBe('开始文案创作');
    expect(page.data.heroCard.description).toBe('6 步完成一轮文案创作，可随时返回修改。');
    expect(page.data.flowSteps).toHaveLength(6);
    expect(page.data.prepCards).toHaveLength(3);
    expect(page.data.prepCards[0].title).toBe('关键词');
    expect(page.data.prepCards[1].title).toBe('想法');
    expect(page.data.prepCards[2].title).toBe('知识库');
  });

  test('keywords page restores pencil-aligned defaults with session', () => {
    createSession();
    require('../../miniprogram/pages/copywriter/keywords/keywords.js');
    const page = global.__getLastPage();
    page.setData = (patch) => {
      page.data = { ...page.data, ...patch };
    };

    page.onShow();

    expect(page.data.heroCard.title).toBe('把你眼前最想写的内容先丢进来');
    expect(page.data.heroCard.description).toContain('支持逗号、换行');
    expect(page.data.keywordsText).toBe('');
  });

  test('ideas page restores pencil-aligned defaults with session', () => {
    createSession();
    updateStepData({ keywordsText: '副业赚钱, 小红书起号' });
    require('../../miniprogram/pages/copywriter/ideas/ideas.js');
    const page = global.__getLastPage();
    page.setData = (patch) => {
      page.data = { ...page.data, ...patch };
    };

    page.onShow();

    expect(page.data.heroCard.title).toBe('补充你真正想表达的观点和角度');
    expect(page.data.heroCard.description).toContain('让后面的选题更像你');
    expect(page.data.saveStatus).toBe('内容已自动保存');
  });
});
