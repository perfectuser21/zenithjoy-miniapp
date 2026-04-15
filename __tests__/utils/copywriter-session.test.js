const {
  clearSession,
  createSession,
  getResumeRoute,
  setCurrentStep,
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

test('resumes to topics after topics are generated but not selected', () => {
  createSession();
  setTopics([{ topicId: 'topic-1', title: '题目 1' }]);

  expect(getResumeRoute()).toBe('/pages/copywriter/topics/topics');
});

test('resumes to articles after articles are generated but not selected', () => {
  createSession();
  setTopics([{ topicId: 'topic-1', title: '题目 1' }]);
  setArticles('topic-1', [{ articleId: 'article-1', content: '正文' }]);

  expect(getResumeRoute()).toBe('/pages/copywriter/articles/articles?topicId=topic-1');
});

test('resumes to article detail after an article is explicitly selected', () => {
  createSession();
  setCurrentStep(6, { topicId: 'topic-1', articleId: 'article-1' });

  expect(getResumeRoute()).toBe(
    '/pages/copywriter/article-detail/article-detail?topicId=topic-1&articleId=article-1'
  );
});
