jest.mock('../../miniprogram/utils/copywriter-session', () => ({
  generateTopics: jest.fn(),
  getResumeRoute: jest.fn(() => '/pages/copywriter/profile/profile'),
  loadSession: jest.fn(() => ({
    stepData: {},
    topics: [{ topicId: 'topic-1', title: '题目 1', summary: '摘要', locked: false }],
    topicsDirty: false,
    articlesDirty: false
  })),
  regenerateTopic: jest.fn(),
  setCurrentStep: jest.fn(),
  setTopics: jest.fn(),
  toggleTopicLock: jest.fn(),
  updateTopic: jest.fn(),
  updateTopicTitle: jest.fn()
}));

jest.mock('../../miniprogram/services/copywriter-ai', () => ({
  generateTopicsWithAI: jest.fn(() => Promise.resolve([]))
}));

jest.mock('../../miniprogram/utils/membership', () => ({
  checkQuota: jest.fn(() => Promise.resolve(true))
}));

describe('copywriter topics routing', () => {
  let sessionModule;

  beforeEach(() => {
    jest.resetModules();
    global.__resetPage();
    jest.isolateModules(() => {
      sessionModule = require('../../miniprogram/utils/copywriter-session');
      sessionModule.setCurrentStep.mockClear();
      require('../../miniprogram/pages/copywriter/topics/topics.js');
    });
  });

  test('onShow clears selected topic/article ids when staying on topics step', async () => {
    const page = global.__getLastPage();
    const instance = {
      ...page,
      data: { ...page.data },
      setData(patch, cb) {
        this.data = { ...this.data, ...patch };
        if (typeof cb === 'function') {
          cb();
        }
      },
      syncTopicScrollbar: jest.fn()
    };

    await instance.onShow();

    expect(sessionModule.setCurrentStep).toHaveBeenCalledWith(4, { topicId: '', articleId: '' });
  });
});
