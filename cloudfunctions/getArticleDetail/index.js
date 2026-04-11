// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const { id } = event;

  if (!id) {
    return { success: false, message: '缺少文章ID' };
  }

  try {
    const res = await db.collection('articles').doc(id).get();
    if (res.data) {
      return { success: true, data: res.data };
    }
    return { success: false, data: null, message: '文章不存在' };
  } catch (err) {
    // DB 查询失败或文章不存在，返回对应备用文章
    const backup = getBackupArticle(id);
    if (backup) {
      return { success: true, data: backup };
    }
    return { success: false, data: null, message: '获取文章详情失败' };
  }
};

function getBackupArticle(id) {
  const articles = {
    article1: {
      id: 'article1',
      title: '如何充分利用AI智能助手提升工作效率',
      content: '<h1>如何充分利用AI智能助手提升工作效率</h1><p>随着AI技术的发展，智能助手已成为提升工作效率的重要工具。本文介绍如何高效使用AI助手完成内容创作、日程管理和信息检索等任务。</p><h2>内容创作加速</h2><p>AI助手可以快速生成初稿、优化文案、翻译内容，将原本需要数小时的工作压缩到分钟级别。</p><h2>信息整理与检索</h2><p>利用AI进行资料汇总、数据分析和关键信息提取，让决策更快更准。</p><h2>工作流自动化</h2><p>将重复性任务交给AI处理，专注于需要创意和判断的高价值工作。</p>',
      cover: '/images/default-cover.png',
      date: '2024-03-15',
      author: 'ZenithJoy编辑部',
      tags: ['AI助手', '效率提升']
    },
    article2: {
      id: 'article2',
      title: 'AI内容创作的最佳实践与技巧',
      content: '<h1>AI内容创作的最佳实践与技巧</h1><p>掌握提示词工程是AI内容创作的核心技能。本文总结经过验证的实战技巧，帮助你快速产出高质量内容。</p><h2>明确指令结构</h2><p>好的提示词应包含：角色设定、任务说明、输出格式、约束条件四个要素。</p><h2>迭代优化</h2><p>第一版输出往往不完美，通过追问和细化要求，逐步得到满意结果。</p><h2>场景化应用</h2><p>不同平台有不同的内容规范，针对小红书、公众号、抖音分别调整表达风格。</p>',
      cover: '/images/default-cover.png',
      date: '2024-03-10',
      author: 'ZenithJoy编辑部',
      tags: ['AI创作', '内容生成']
    }
  };
  return articles[id] || null;
}
