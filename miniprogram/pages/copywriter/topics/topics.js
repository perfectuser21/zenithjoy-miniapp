const {
  generateTopics,
  getResumeRoute,
  loadSession,
  regenerateTopic,
  setCurrentStep,
  setTopics,
  toggleTopicLock,
  updateTopic,
  updateTopicTitle
} = require('../../../utils/copywriter-session');
const { generateTopicsWithAI } = require('../../../services/copywriter-ai');
const { checkQuota } = require('../../../utils/membership');

function buildSummaryRows(stepData) {
  return [
    { label: '关键词', value: stepData.keywordsText || '未填写' },
    { label: '灵感', value: stepData.ideasText || '未填写' },
    { label: '目标人群', value: (stepData.audienceTags || []).join('、') || '未填写' },
    { label: '有价值', value: stepData.valueText || '未填写' },
    { label: 'IP', value: stepData.ipText || '未填写' }
  ];
}

function buildTopicCards(topics) {
  return (topics || []).map((topic) => ({
    ...topic,
    lockLabel: topic.locked ? '取消锁定' : '锁定'
  }));
}

function mergeTopicResults(currentTopics, nextTopics) {
  const unlockedTopics = (nextTopics || []).map((topic) => ({
    ...topic,
    locked: false
  }));
  let unlockedIndex = 0;

  const result = (currentTopics || []).map((topic) => {
    if (topic.locked) {
      console.log('[mergeTopicResults] 保留锁定选题:', topic.topicId, topic.title);
      return topic;
    }

    const replacement = unlockedTopics[unlockedIndex];
    unlockedIndex += 1;
    return replacement || topic;
  });

  const lockedCount = result.filter((t) => t.locked).length;
  console.log('[mergeTopicResults] 合并完成，共', result.length, '个选题，其中锁定', lockedCount, '个');
  return result;
}

Page({
  data: {
    heroCard: {
      kicker: 'STEP 4 · 选题生成',
      title: '先选一个你最想写的方向',
      description: '已基于你的创作条件生成 5 个候选选题。'
    },
    summaryRows: [],
    topicCards: [],
    topicsDirty: false,
    articlesDirty: false,
    generating: false
  },

  async onShow() {
    this.refreshPage();
    if (!this.data.topicCards.length) {
      await this.generateWithAI(true);
      return;
    }

    setCurrentStep(4, { topicId: '', articleId: '' });
  },

  refreshPage() {
    const session = loadSession();
    if (!session) {
      wx.redirectTo({ url: '/pages/copywriter/start/start' });
      return;
    }

    this.setData(
      {
        heroCard: {
          kicker: 'STEP 4 · 选题生成',
          title: '先选一个你最想写的方向',
          description: `已基于你的创作条件生成 ${(session.topics || []).length || 5} 个候选选题。`
        },
        summaryRows: buildSummaryRows(session.stepData || {}),
        topicCards: buildTopicCards(session.topics || []),
        topicsDirty: !!session.topicsDirty,
        articlesDirty: !!session.articlesDirty
      }
    );
  },

  async generateWithAI(useLoading = true) {
    if (!(await checkQuota())) return;

    const session = loadSession();
    if (!session) {
      return;
    }

    if (useLoading) {
      this.setData({ generating: true });
      wx.showLoading({ title: '生成选题中...', mask: true });
    }

    try {
      const topics = await generateTopicsWithAI(session.stepData);
      if (!topics.length) {
        throw new Error('未生成到有效选题');
      }
      const mergedTopics = session.topics.length
        ? mergeTopicResults(session.topics, topics)
        : topics;
      setTopics(mergedTopics);
      this.refreshPage();
    } catch (error) {
      console.error('AI 生成选题失败，回退本地结果:', error);
      generateTopics();
      this.refreshPage();
      wx.showToast({ title: 'AI 生成失败，已使用默认选题', icon: 'none' });
    } finally {
      if (useLoading) {
        wx.hideLoading();
      }
      this.setData({ generating: false });
    }
  },

  regenerateAll() {
    this.generateWithAI(true);
  },

  regenerateOne(e) {
    regenerateTopic(e.currentTarget.dataset.id);
    this.refreshPage();
  },

  lockTopic(e) {
    toggleTopicLock(e.currentTarget.dataset.id);
    this.refreshPage();
  },

  editTopic(e) {
    const { id, title, summary } = e.currentTarget.dataset;
    wx.showModal({
      title: '编辑选题标题',
      editable: true,
      placeholderText: title,
      success: (res) => {
        if (!res.confirm) {
          return;
        }

        updateTopicTitle(id, (res.content || '').trim() || title);
        wx.showModal({
          title: '编辑选题摘要',
          editable: true,
          placeholderText: summary,
          success: (summaryRes) => {
            if (summaryRes.confirm) {
              updateTopic(id, {
                summary: (summaryRes.content || '').trim() || summary
              });
            }

            this.refreshPage();
          }
        });
      }
    });
  },

  openArticles(e) {
    const topicId = e.currentTarget.dataset.id;
    setCurrentStep(5, { topicId, articleId: '' });
    wx.redirectTo({ url: `/pages/copywriter/articles/articles?topicId=${topicId}` });
  },

  goBack() {
    const session = loadSession();
    const route = getResumeRoute({
      ...session,
      currentStep: 3,
      currentTopicId: '',
      currentArticleId: ''
    });
    wx.redirectTo({ url: route });
  }
});
