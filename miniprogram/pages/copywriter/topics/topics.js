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
    summaryOpen: false,
    summaryToggleText: '查看',
    summaryRows: [],
    topicCards: [],
    topicsDirty: false,
    articlesDirty: false,
    generating: false,
    showTopicScrollbar: false,
    topicScrollbarThumbTop: 0,
    topicScrollbarThumbHeight: 0
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
        summaryRows: buildSummaryRows(session.stepData || {}),
        topicCards: buildTopicCards(session.topics || []),
        topicsDirty: !!session.topicsDirty,
        articlesDirty: !!session.articlesDirty,
        summaryToggleText: this.data.summaryOpen ? '收起' : '查看'
      },
      () => this.syncTopicScrollbar()
    );
  },

  toggleSummary() {
    const summaryOpen = !this.data.summaryOpen;
    this.setData({
      summaryOpen,
      summaryToggleText: summaryOpen ? '收起' : '查看'
    });
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
  },

  handleTopicScroll(e) {
    const { scrollTop = 0, scrollHeight = 0 } = e.detail || {};
    this.updateTopicScrollbar(scrollTop, scrollHeight);
  },

  syncTopicScrollbar() {
    wx.nextTick(() => {
      const query = wx.createSelectorQuery().in(this);
      query.select('.topic-scroll').boundingClientRect();
      query.select('.topic-list-inner').boundingClientRect();
      query.exec((res) => {
        const scrollRect = res && res[0];
        const contentRect = res && res[1];
        if (!scrollRect || !contentRect) {
          return;
        }

        this.updateTopicScrollbar(0, contentRect.height, scrollRect.height);
      });
    });
  },

  updateTopicScrollbar(scrollTop, scrollHeight, viewportHeight) {
    const currentViewportHeight = viewportHeight || this.topicViewportHeight || 0;
    if (!currentViewportHeight || !scrollHeight || scrollHeight <= currentViewportHeight) {
      this.topicViewportHeight = currentViewportHeight;
      this.setData({
        showTopicScrollbar: false,
        topicScrollbarThumbTop: 0,
        topicScrollbarThumbHeight: 0
      });
      return;
    }

    this.topicViewportHeight = currentViewportHeight;
    const minThumbHeight = 36;
    const thumbHeight = Math.max(
      minThumbHeight,
      (currentViewportHeight * currentViewportHeight) / scrollHeight
    );
    const maxScrollTop = Math.max(scrollHeight - currentViewportHeight, 1);
    const maxThumbTop = currentViewportHeight - thumbHeight;
    const thumbTop = Math.min(maxThumbTop, (scrollTop / maxScrollTop) * maxThumbTop);

    this.setData({
      showTopicScrollbar: true,
      topicScrollbarThumbTop: thumbTop,
      topicScrollbarThumbHeight: thumbHeight
    });
  }
});
