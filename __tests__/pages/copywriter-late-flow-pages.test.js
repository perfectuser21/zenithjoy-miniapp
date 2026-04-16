const {
  clearSession,
  createSession,
  generateArticles,
  generateTopics,
  loadSession,
  setCurrentStep,
  updateStepData
} = require('../../miniprogram/utils/copywriter-session');

describe('copywriter late flow pencil defaults', () => {
  beforeEach(() => {
    jest.resetModules();
    global.__resetPage();
  });

  afterEach(() => {
    clearSession();
  });

  test('profile page exposes pencil-aligned hero copy', () => {
    createSession();
    require('../../miniprogram/pages/copywriter/profile/profile.js');
    const page = global.__getLastPage();
    page.setData = (patch) => {
      page.data = { ...page.data, ...patch };
    };

    page.onShow();

    expect(page.data.heroCard.title).toBe('把知识库里的核心约束补全');
    expect(page.data.heroCard.description).toContain('目标人群、价值和 IP 背书');
  });

  test('topics page restores pencil-aligned hero copy', () => {
    createSession();
    updateStepData({
      keywordsText: '副业赚钱',
      ideasText: '想讲普通人为什么做内容总是卡住',
      audienceTags: ['普通创作者'],
      valueText: '帮你更快理顺表达路径',
      ipText: '实操派内容创作者'
    });
    generateTopics();
    require('../../miniprogram/pages/copywriter/topics/topics.js');
    const page = global.__getLastPage();
    page.setData = (patch, cb) => {
      page.data = { ...page.data, ...patch };
      if (cb) cb();
    };
    page.syncTopicScrollbar = jest.fn();

    page.refreshPage();

    expect(page.data.heroCard.title).toBe('先选一个你最想写的方向');
    expect(page.data.heroCard.description).toContain('已基于你的创作条件生成 5 个候选选题');
  });

  test('articles page restores pencil-aligned hero copy', () => {
    createSession();
    updateStepData({ keywordsText: '副业赚钱' });
    generateTopics();
    const session = loadSession();
    const topicId = session.topics[0].topicId;
    generateArticles(topicId);

    require('../../miniprogram/pages/copywriter/articles/articles.js');
    const page = global.__getLastPage();
    page.setData = (patch, cb) => {
      page.data = { ...page.data, ...patch };
      if (cb) cb();
    };
    page.syncPreviewScrollbar = jest.fn();
    page.data.topicId = topicId;

    page.refreshPage();

    expect(page.data.heroCard.title).toBe('先看结构，再决定用哪一个版本')
    expect(page.data.heroCard.description).toContain('已基于当前选题生成')
  });

  test('article detail page exposes pencil-aligned hero copy', () => {
    createSession();
    updateStepData({ keywordsText: '副业赚钱' });
    generateTopics();
    const session = loadSession();
    const topicId = session.topics[0].topicId;
    generateArticles(topicId);
    const articleId = loadSession().articlesByTopic[topicId][0].articleId;
    setCurrentStep(6, { topicId, articleId });

    require('../../miniprogram/pages/copywriter/article-detail/article-detail.js');
    const page = global.__getLastPage();
    page.setData = (patch) => {
      page.data = { ...page.data, ...patch };
    };
    page.data.topicId = topicId;
    page.data.articleId = articleId;

    page.refresh();

    expect(page.data.heroCard.title).toBe('把这篇文案修到可发布');
    expect(page.data.heroCard.description).toContain('聚焦最终文本和动作按钮');
  });
});
