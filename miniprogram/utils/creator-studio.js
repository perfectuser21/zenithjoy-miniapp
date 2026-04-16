const {
  getArticle,
  getTopic,
  loadSession
} = require('./copywriter-session');

const STORAGE_KEY = 'creator_studio_state';

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function loadStudioState() {
  const stored = wx.getStorageSync(STORAGE_KEY);
  if (!stored) {
    return {
      titleLibrary: [],
      lastTitleResults: [],
      lastMomentsDrafts: []
    };
  }

  return {
    titleLibrary: stored.titleLibrary || [],
    lastTitleResults: stored.lastTitleResults || [],
    lastMomentsDrafts: stored.lastMomentsDrafts || []
  };
}

function saveStudioState(state) {
  const nextState = clone(state);
  wx.setStorageSync(STORAGE_KEY, nextState);
  return nextState;
}

function patchStudioState(updater) {
  const current = loadStudioState();
  const nextState = updater(clone(current)) || current;
  return saveStudioState(nextState);
}

function getSourceContext() {
  const session = loadSession();
  if (!session) {
    return {
      topicTitle: '为什么很多内容创作者越努力，反而越写不出来',
      topicSummary: '围绕方向、结构和表达方式，生成更适合发布的标题和朋友圈文案。',
      articleContent: '很多人做内容时，最先补的都是努力。但真正决定结果的，往往不是你写得够不够狠，而是方向、结构和表达方式有没有先被调顺。底层问题一旦校准，内容才会真正开始长出来。',
      sourceLabel: '当前暂无草稿，已使用默认内容'
    };
  }

  const topic = session.currentTopicId ? getTopic(session, session.currentTopicId) : session.topics[0];
  const article = topic && session.currentArticleId
    ? getArticle(session, topic.topicId, session.currentArticleId)
    : null;
  const firstArticle = topic && (session.articlesByTopic[topic.topicId] || [])[0];
  const resolvedArticle = article || firstArticle || null;

  return {
    topicTitle: (topic && topic.title) || '先从一个更容易发布的方向开始',
    topicSummary: (topic && topic.summary) || '把现有内容提炼成更容易点击和转发的表达版本。',
    articleContent: (resolvedArticle && resolvedArticle.content) || '很多人做内容时，最先补的都是努力。但真正决定结果的，往往不是你写得够不够狠，而是方向、结构和表达方式有没有先被调顺。底层问题一旦校准，内容才会真正开始长出来。',
    sourceLabel: topic ? '已自动带入当前创作内容' : '当前暂无草稿，已使用默认内容'
  };
}

function buildTitleResults(context) {
  const baseTitle = context.topicTitle || '做内容之前，先把方向调顺';
  const trimmed = baseTitle.replace(/[｜|].*$/, '').trim();

  return [
    {
      id: createId('title'),
      text: `你不是写不出来，而是一开始就把方向做错了`,
      note: '强冲突开头，适合做主标题',
      tag: '已锁定',
      status: 'locked'
    },
    {
      id: createId('title'),
      text: `为什么越努力做内容的人，反而越容易写废`,
      note: '更适合做观点型封面标题',
      tag: '待比较',
      status: 'compare'
    },
    {
      id: createId('title'),
      text: `${trimmed}，最该先补上的其实不是努力`,
      note: '适合作为公众号标题和副封面文案',
      tag: '备选中',
      status: 'saved'
    },
    {
      id: createId('title'),
      text: '做内容最怕的，不是没天赋，而是方向一直没校准',
      note: '更适合认知表达和转发场景',
      tag: '待比较',
      status: 'compare'
    },
    {
      id: createId('title'),
      text: '普通人把内容越做越累，往往是从一开始就写反了',
      note: '适合短视频封面和首屏标题',
      tag: '待比较',
      status: 'compare'
    },
    {
      id: createId('title'),
      text: `${trimmed}，先别逼自己努力，先把结构调顺`,
      note: '适合搭配方法型副标题使用',
      tag: '备选中',
      status: 'saved'
    }
  ];
}

function saveTitleResults(results) {
  patchStudioState((state) => {
    state.lastTitleResults = results || [];
    return state;
  });
}

function getLastTitleResults() {
  const state = loadStudioState();
  return state.lastTitleResults || [];
}

function addTitleResultsToLibrary(results) {
  return patchStudioState((state) => {
    const existingTexts = new Set((state.titleLibrary || []).map((item) => item.text));
    const additions = (results || [])
      .filter((item) => item && item.text && !existingTexts.has(item.text))
      .map((item, index) => ({
        id: item.id || createId('library'),
        text: item.text,
        note: item.note,
        status: item.status || (index === 0 ? 'locked' : index === 1 ? 'compare' : 'saved')
      }));
    state.titleLibrary = [...(state.titleLibrary || []), ...additions];
    return state;
  });
}

function getTitleLibrary() {
  const state = loadStudioState();
  if (state.titleLibrary && state.titleLibrary.length) {
    return state.titleLibrary;
  }

  const seedResults = buildTitleResults(getSourceContext());
  const fallback = [
    {
      id: seedResults[0].id,
      text: seedResults[0].text,
      note: '主标题候选，准备带回创作页',
      status: 'locked'
    },
    {
      id: seedResults[1].id,
      text: seedResults[1].text,
      note: '更适合做观点型封面标题',
      status: 'compare'
    },
    {
      id: seedResults[2].id,
      text: seedResults[2].text,
      note: '适合公众号标题和副封面文案',
      status: 'saved'
    },
    {
      id: seedResults[3].id,
      text: seedResults[3].text,
      note: '更适合认知表达和转发场景',
      status: 'compare'
    },
    {
      id: seedResults[4].id,
      text: seedResults[4].text,
      note: '适合短视频封面和首屏标题',
      status: 'compare'
    },
    {
      id: seedResults[5].id,
      text: seedResults[5].text,
      note: '适合搭配方法型副标题使用',
      status: 'saved'
    },
    {
      id: createId('library'),
      text: '做内容这件事，真正先要解决的从来不是努力',
      note: '更偏认知教育，适合做第二主标题',
      status: 'locked'
    },
    {
      id: createId('library'),
      text: '越努力越没结果的人，往往不是输在执行，而是输在起点',
      note: '更适合长图首屏和转发场景',
      status: 'compare'
    },
    {
      id: createId('library'),
      text: '写不出来，不一定是不会写，而是你从第一步就走偏了',
      note: '适合情绪型表达和标题测试',
      status: 'saved'
    },
    {
      id: createId('library'),
      text: '很多人内容做不起来，不是懒，而是方向和结构没有先理顺',
      note: '适合作为方法型封面标题',
      status: 'compare'
    },
    {
      id: createId('library'),
      text: '为什么有些人越认真做内容，反而越容易把自己写空',
      note: '适合深度观点型内容',
      status: 'saved'
    },
    {
      id: createId('library'),
      text: '普通人做内容最容易踩的坑，不是断更，而是一开始方向就错了',
      note: '适合主标题与副标题组合使用',
      status: 'locked'
    }
  ];

  patchStudioState((nextState) => {
    nextState.titleLibrary = fallback;
    nextState.lastTitleResults = fallback.map((item) => ({
      id: item.id,
      text: item.text,
      note: item.note,
      tag: indexToTag(item.status)
    }));
    return nextState;
  });

  return fallback;
}

function indexToTag(status) {
  if (status === 'locked') return '已锁定';
  if (status === 'compare') return '待比较';
  return '备选中';
}

function toggleTitleLibraryStatus(id) {
  return patchStudioState((state) => {
    state.titleLibrary = (state.titleLibrary || []).map((item) => {
      if (item.id !== id) {
        return item;
      }

      const nextStatus = item.status === 'locked' ? 'saved' : 'locked';
      return { ...item, status: nextStatus };
    });
    return state;
  });
}

function removeTitleLibraryItem(id) {
  return patchStudioState((state) => {
    state.titleLibrary = (state.titleLibrary || []).filter((item) => item.id !== id);
    return state;
  });
}

function getFinalTitle() {
  const library = getTitleLibrary();
  return library.find((item) => item.status === 'locked') || library[0] || null;
}

function buildMomentsDrafts(context) {
  const body = context.articleContent || getSourceContext().articleContent;
  return [
    {
      id: createId('moment'),
      content: body,
      meta: '价值表达 · 适合直接发布'
    },
    {
      id: createId('moment'),
      content: '不是你不够努力，而是很多时候内容迟迟起不来，本质上是方向、结构和表达方式还没有被调顺。先把底层逻辑理清，输出才会开始变稳。',
      meta: '观点型版本 · 更适合建立认知'
    },
    {
      id: createId('moment'),
      content: '很多人一开始把内容做不起来，不是因为不肯努力，而是还没先把方向和表达方式调顺。底层一旦通了，写字就不会再那么拧巴。',
      meta: '轻口语版本 · 更像朋友圈日常表达'
    }
  ];
}

function saveMomentsDrafts(drafts) {
  patchStudioState((state) => {
    state.lastMomentsDrafts = drafts || [];
    return state;
  });
}

function getLastMomentsDrafts() {
  const state = loadStudioState();
  if (state.lastMomentsDrafts && state.lastMomentsDrafts.length) {
    return state.lastMomentsDrafts;
  }

  const drafts = buildMomentsDrafts(getSourceContext());
  saveMomentsDrafts(drafts);
  return drafts;
}

module.exports = {
  addTitleResultsToLibrary,
  buildMomentsDrafts,
  buildTitleResults,
  getFinalTitle,
  getLastMomentsDrafts,
  getLastTitleResults,
  getSourceContext,
  getTitleLibrary,
  removeTitleLibraryItem,
  saveMomentsDrafts,
  saveTitleResults,
  toggleTitleLibraryStatus
};
