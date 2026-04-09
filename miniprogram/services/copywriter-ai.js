const TOPIC_BOT_ID = '7481213430658433034';
const ARTICLE_BOT_ID = '7481212266399449139';

function cleanJsonText(text) {
  const raw = (text || '').trim();
  if (!raw) {
    throw new Error('AI 返回为空');
  }

  const fenced = raw.match(/```json\s*([\s\S]*?)```/i) || raw.match(/```\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : raw;
  const start = Math.min(...['{', '['].map((token) => {
    const index = candidate.indexOf(token);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  }));
  const normalizedStart = start === Number.MAX_SAFE_INTEGER ? 0 : start;
  const sliced = candidate.slice(normalizedStart);
  const endObject = sliced.lastIndexOf('}');
  const endArray = sliced.lastIndexOf(']');
  const end = Math.max(endObject, endArray);
  const finalText = end >= 0 ? sliced.slice(0, end + 1) : sliced;
  return finalText;
}

function parseJsonPayload(text) {
  return JSON.parse(cleanJsonText(text));
}

function callAI(message, botId) {
  return wx.cloud.callFunction({
    name: 'cozeAPIv2',
    data: {
      message,
      botId
    }
  }).then((res) => {
    if (!res.result || !res.result.success) {
      throw new Error((res.result && res.result.error) || 'AI 生成失败');
    }

    return res.result.content || '';
  });
}

function buildStepContext(stepData) {
  return [
    `关键词：${stepData.keywordsText || '无'}`,
    `灵感：${stepData.ideasText || '无'}`,
    `风格：${(stepData.styleTags || []).join('、') || '无'}`,
    `约束：${stepData.constraintsText || '无'}`,
    `目标人群：${(stepData.audienceTags || []).join('、') || '无'}`,
    `有价值：${stepData.valueText || '无'}`,
    `IP：${stepData.ipText || '无'}`
  ].join('\n');
}

function generateTopicsWithAI(stepData) {
  const prompt = [
    '你是中文内容策划师。请基于以下创作条件生成 5 个不同方向的内容选题。',
    buildStepContext(stepData),
    '输出要求：只返回 JSON，不要解释，不要 Markdown。',
    'JSON 结构：',
    '{"topics":[{"title":"","summary":"","typeTag":"教程|观点|故事|清单|避坑","platformTags":["公众号","小红书"]}]}',
    '要求：',
    '1. 必须返回 5 个 topics',
    '2. title 要像真实可发的中文选题',
    '3. summary 40-80 字',
    '4. typeTag 必须是给定枚举之一',
    '5. platformTags 返回 1-2 个平台'
  ].join('\n\n');

  return callAI(prompt, TOPIC_BOT_ID).then((content) => {
    const payload = parseJsonPayload(content);
    return Array.isArray(payload.topics) ? payload.topics : [];
  });
}

function generateArticlesWithAI(stepData, topic) {
  const prompt = [
    '你是中文文章写作助手。请围绕给定选题生成 3 篇风格明确不同的文章。',
    buildStepContext(stepData),
    `当前选题标题：${topic.title}`,
    `当前选题摘要：${topic.summary}`,
    '三篇文章必须分别对应 tutorial、opinion、story 三种 variantType。',
    '输出要求：只返回 JSON，不要解释，不要 Markdown。',
    'JSON 结构：',
    '{"articles":[{"variantType":"tutorial|opinion|story","title":"","content":""}]}',
    '要求：',
    '1. 必须返回 3 篇文章',
    '2. content 必须是完整中文文章，至少 600 字',
    '3. 三篇文章角度和结构明显不同',
    '4. title 要可直接用于发布'
  ].join('\n\n');

  return callAI(prompt, ARTICLE_BOT_ID).then((content) => {
    const payload = parseJsonPayload(content);
    return Array.isArray(payload.articles) ? payload.articles : [];
  });
}

module.exports = {
  generateArticlesWithAI,
  generateTopicsWithAI
};
