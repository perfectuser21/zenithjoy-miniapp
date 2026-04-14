const STORAGE_KEY = 'copywriter_current_session';
let memorySession = null;

const ARTICLE_VARIANTS = [
  { type: 'tutorial', label: '教程型' },
  { type: 'opinion', label: '观点型' },
  { type: 'story', label: '故事型' }
];

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function parseTags(text) {
  return (text || '')
    .split(/[\n,，、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getVariantLabel(type) {
  const variant = ARTICLE_VARIANTS.find((item) => item.type === type);
  return variant ? variant.label : '文章';
}

function buildTopic(stepData, index) {
  const keywords = parseTags(stepData.keywordsText);
  const base = keywords[index % Math.max(keywords.length, 1)] || '内容创作';
  const audience = stepData.audienceTags[0] || '普通创作者';
  const types = ['教程', '观点', '故事', '清单', '避坑'];
  const titles = [
    `${audience}做${base}时，最该先补上的 3 个动作`,
    `为什么大多数人做${base}，一开始就把方向弄错了`,
    `我用一次${base}实战，验证了一个更有效的内容方法`,
    `围绕${base}，这 5 个选题最容易做出结果`,
    `做${base}前，${audience}最容易忽略的几个坑`
  ];

  return {
    topicId: createId('topic'),
    title: titles[index],
    summary: `围绕“${base}”生成的候选方向 ${index + 1}，会优先突出“${stepData.valueText || '给读者明确价值'}”这个核心价值。`,
    typeTag: types[index],
    platformTags: ['公众号', '小红书'],
    locked: false,
    status: 'success'
  };
}

function buildArticle(session, topic, variant) {
  const audience = session.stepData.audienceTags[0] || '正在做内容的人';
  const valueText = session.stepData.valueText || '给读者一个清晰、可执行的判断';
  const ipText = session.stepData.ipText || '实操派创作者';
  const content = [
    `关于“${topic.title}”，很多人最大的问题不是不会写，而是不知道该先写什么。`,
    `如果这篇文章是写给 ${audience}，那我更建议把重点放在“${valueText}”上，而不是堆信息。`,
    `真正让内容成立的，不只是方法本身，还有你是谁、你凭什么这么说。这里最重要的身份支撑就是：${ipText}。`,
    variant.type === 'tutorial'
      ? '所以这篇文章最适合写成步骤型，先讲问题，再讲方法，最后讲如何开始执行。'
      : variant.type === 'opinion'
        ? '所以这篇文章更适合写成观点型，把立场先亮出来，再解释为什么大多数人会做错。'
        : '所以这篇文章更适合写成故事型，用一个真实场景或经历把结论带出来。',
    '当你把结构和立场写清楚，这篇内容才会真正变得有说服力。'
  ].join('\n\n');

  return {
    articleId: createId('article'),
    topicId: topic.topicId,
    variantType: variant.type,
    variantLabel: variant.label,
    title: `${topic.title}｜${variant.label}版本`,
    content,
    preview200: content.slice(0, 200),
    wordCount: content.length,
    status: 'success'
  };
}

function normalizeTopic(topic, index) {
  return {
    topicId: topic.topicId || createId('topic'),
    title: topic.title || `候选选题 ${index + 1}`,
    summary: topic.summary || '围绕当前创作条件生成的选题摘要。',
    typeTag: topic.typeTag || '观点',
    platformTags: Array.isArray(topic.platformTags) && topic.platformTags.length ? topic.platformTags : ['公众号', '小红书'],
    locked: !!topic.locked,
    status: topic.status || 'success'
  };
}

function normalizeArticle(topicId, article, index) {
  const variantType = article.variantType || ARTICLE_VARIANTS[index] && ARTICLE_VARIANTS[index].type || 'tutorial';
  const content = article.content || '';
  return {
    articleId: article.articleId || createId('article'),
    topicId,
    variantType,
    variantLabel: article.variantLabel || getVariantLabel(variantType),
    title: article.title || `文章版本 ${index + 1}`,
    content,
    preview200: article.preview200 || content.slice(0, 200),
    wordCount: article.wordCount || content.length,
    status: article.status || 'success'
  };
}

function getDefaultSession() {
  return {
    sessionId: createId('session'),
    currentStep: 0,
    currentTopicId: '',
    currentArticleId: '',
    stepData: {
      keywordsText: '',
      ideasText: '',
      styleTags: [],
      constraintsText: '',
      audienceTags: [],
      valueText: '',
      ipText: ''
    },
    topics: [],
    articlesByTopic: {},
    topicsDirty: false,
    articlesDirty: false,
    lastEditedAt: Date.now()
  };
}

function loadSession() {
  const stored = typeof wx.getStorageSync === 'function'
    ? wx.getStorageSync(STORAGE_KEY)
    : memorySession;
  return stored ? clone(stored) : null;
}

function saveSession(session) {
  const nextSession = clone({ ...session, lastEditedAt: Date.now() });
  if (typeof wx.setStorageSync === 'function') {
    wx.setStorageSync(STORAGE_KEY, nextSession);
  } else {
    memorySession = nextSession;
  }
  return nextSession;
}

function patchSession(updater) {
  const session = loadSession() || getDefaultSession();
  return saveSession(updater(clone(session)) || session);
}

function createSession() {
  return saveSession(getDefaultSession());
}

function clearSession() {
  memorySession = null;
  if (typeof wx.removeStorageSync === 'function') {
    wx.removeStorageSync(STORAGE_KEY);
    return;
  }

  if (typeof wx.clearStorageSync === 'function') {
    wx.clearStorageSync();
  }
}

function updateStepData(patch) {
  return patchSession((session) => {
    session.stepData = { ...session.stepData, ...patch };
    if (Object.prototype.hasOwnProperty.call(patch, 'keywordsText')) {
      session.currentStep = 1;
    } else if (
      Object.prototype.hasOwnProperty.call(patch, 'ideasText') ||
      Object.prototype.hasOwnProperty.call(patch, 'constraintsText') ||
      Object.prototype.hasOwnProperty.call(patch, 'styleTags')
    ) {
      session.currentStep = 2;
    } else if (
      Object.prototype.hasOwnProperty.call(patch, 'audienceTags') ||
      Object.prototype.hasOwnProperty.call(patch, 'valueText') ||
      Object.prototype.hasOwnProperty.call(patch, 'ipText')
    ) {
      session.currentStep = 3;
    }
    session.topicsDirty = session.topics.length > 0;
    session.articlesDirty = Object.keys(session.articlesByTopic).length > 0;
    return session;
  });
}

function setTopics(topics) {
  return patchSession((session) => {
    session.topics = (topics || []).map((topic, index) => normalizeTopic(topic, index));
    session.topicsDirty = false;
    session.articlesDirty = true;
    session.currentStep = 4;
    session.currentTopicId = session.topics[0] ? session.topics[0].topicId : '';
    session.currentArticleId = '';
    return session;
  });
}

function generateTopics() {
  return setTopics(new Array(5).fill(null).map((_, index) => buildTopic(loadSession()?.stepData || getDefaultSession().stepData, index)));
}

function regenerateTopic(topicId) {
  return patchSession((session) => {
    session.topics = session.topics.map((topic, index) => (
      topic.topicId === topicId && !topic.locked ? buildTopic(session.stepData, index) : topic
    ));
    session.articlesDirty = true;
    return session;
  });
}

function toggleTopicLock(topicId) {
  return patchSession((session) => {
    session.topics = session.topics.map((topic) => (
      topic.topicId === topicId ? { ...topic, locked: !topic.locked } : topic
    ));
    return session;
  });
}

function updateTopicTitle(topicId, title) {
  return patchSession((session) => {
    session.topics = session.topics.map((topic) => (
      topic.topicId === topicId ? { ...topic, title: title || topic.title } : topic
    ));
    return session;
  });
}

function updateTopic(topicId, patch) {
  return patchSession((session) => {
    session.topics = session.topics.map((topic) => (
      topic.topicId === topicId ? { ...topic, ...patch } : topic
    ));
    return session;
  });
}

function setArticles(topicId, articles) {
  return patchSession((session) => {
    session.articlesByTopic[topicId] = (articles || []).map((article, index) => normalizeArticle(topicId, article, index));
    session.articlesDirty = false;
    session.currentStep = 5;
    session.currentTopicId = topicId;
    session.currentArticleId = session.articlesByTopic[topicId][0]
      ? session.articlesByTopic[topicId][0].articleId
      : '';
    return session;
  });
}

function generateArticles(topicId) {
  return patchSession((session) => {
    const topic = session.topics.find((item) => item.topicId === topicId);
    if (!topic) {
      return session;
    }

    session.articlesByTopic[topicId] = ARTICLE_VARIANTS.map((variant) => buildArticle(session, topic, variant));
    session.articlesDirty = false;
    session.currentStep = 5;
    session.currentTopicId = topicId;
    session.currentArticleId = session.articlesByTopic[topicId][0]
      ? session.articlesByTopic[topicId][0].articleId
      : '';
    return session;
  });
}

function regenerateArticle(topicId, articleId) {
  return patchSession((session) => {
    const topic = session.topics.find((item) => item.topicId === topicId);
    if (!topic) {
      return session;
    }

    session.articlesByTopic[topicId] = (session.articlesByTopic[topicId] || []).map((article) => {
      if (article.articleId !== articleId) {
        return article;
      }

      const variant = ARTICLE_VARIANTS.find((item) => item.type === article.variantType) || ARTICLE_VARIANTS[0];
      return buildArticle(session, topic, variant);
    });
    return session;
  });
}

function updateArticle(topicId, articleId, patch) {
  return patchSession((session) => {
    session.articlesByTopic[topicId] = (session.articlesByTopic[topicId] || []).map((article) => {
      if (article.articleId !== articleId) {
        return article;
      }

      const nextArticle = { ...article, ...patch };
      if (typeof patch.content === 'string') {
        nextArticle.preview200 = patch.content.slice(0, 200);
        nextArticle.wordCount = patch.content.length;
      }
      if (typeof patch.title === 'string' && !patch.content) {
        nextArticle.preview200 = nextArticle.content.slice(0, 200);
      }
      return nextArticle;
    });
    session.currentStep = 6;
    session.currentTopicId = topicId;
    session.currentArticleId = articleId;
    return session;
  });
}

function setCurrentStep(step, extra = {}) {
  return patchSession((session) => {
    session.currentStep = step;
    if (Object.prototype.hasOwnProperty.call(extra, 'topicId')) {
      session.currentTopicId = extra.topicId || '';
    }
    if (Object.prototype.hasOwnProperty.call(extra, 'articleId')) {
      session.currentArticleId = extra.articleId || '';
    }
    return session;
  });
}

function getResumeRoute(session = loadSession()) {
  if (!session) {
    return '/pages/copywriter/start/start';
  }

  if (session.currentArticleId && session.currentTopicId) {
    return `/pages/copywriter/article-detail/article-detail?topicId=${session.currentTopicId}&articleId=${session.currentArticleId}`;
  }

  if (session.currentTopicId) {
    return `/pages/copywriter/articles/articles?topicId=${session.currentTopicId}`;
  }

  if (session.currentStep >= 4) {
    return '/pages/copywriter/topics/topics';
  }

  if (session.currentStep >= 3) {
    return '/pages/copywriter/profile/profile';
  }

  if (session.currentStep >= 2) {
    return '/pages/copywriter/ideas/ideas';
  }

  if (session.currentStep >= 1) {
    return '/pages/copywriter/keywords/keywords';
  }

  return '/pages/copywriter/start/start';
}

function getTopic(session, topicId) {
  return (session.topics || []).find((item) => item.topicId === topicId) || null;
}

function getArticle(session, topicId, articleId) {
  return ((session.articlesByTopic || {})[topicId] || []).find((item) => item.articleId === articleId) || null;
}

module.exports = {
  ARTICLE_VARIANTS,
  clearSession,
  createSession,
  generateArticles,
  generateTopics,
  getArticle,
  getTopic,
  getVariantLabel,
  loadSession,
  regenerateArticle,
  regenerateTopic,
  saveSession,
  setArticles,
  setCurrentStep,
  setTopics,
  toggleTopicLock,
  updateTopic,
  updateArticle,
  updateStepData,
  updateTopicTitle,
  getResumeRoute
};
