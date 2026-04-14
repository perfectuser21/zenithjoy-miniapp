const {
  clearSession,
  createSession,
  getResumeRoute,
  setArticles,
  setTopics,
  updateStepData
} = require('../../miniprogram/utils/copywriter-session');

afterEach(() => clearSession());

test('resumes to keywords after keywords are entered', () => {
  createSession();
  updateStepData({ keywordsText: 'AI, 短视频' });

  expect(getResumeRoute()).toBe('/pages/copywriter/keywords/keywords');
});

test('resumes to article detail after an article is selected', () => {
  createSession();
  setTopics([{ topicId: 'topic-1', title: '题目 1' }]);
  setArticles('topic-1', [{ articleId: 'article-1', content: '正文' }]);

  expect(getResumeRoute()).toBe(
    '/pages/copywriter/article-detail/article-detail?topicId=topic-1&articleId=article-1'
  );
});
