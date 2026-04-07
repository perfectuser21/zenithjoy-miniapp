const WORKFLOW_META = {
  '脚本生成器': {
    badge: '内容产出',
    objective: '把一个想法整理成可直接发布的内容成果。',
    metrics: ['结构完整', '可执行', '适合继续追问'],
    prompts: ['帮我补成 60 秒短视频脚本', '再给我 5 个标题版本', '按种草风格重写一版']
  },
  '选题策划师': {
    badge: '内容规划',
    objective: '围绕你的定位给出今天最值得做的选题方向。',
    metrics: ['更贴近账号定位', '更适合增长', '能继续延展成脚本'],
    prompts: ['再细分成 3 条选题线', '给我一个 7 天内容计划', '筛出最适合新账号的方向']
  },
  '对标账号分析': {
    badge: '增长调研',
    objective: '拆出参考账号的定位、结构和可复制动作。',
    metrics: ['定位更清楚', '结构可拆', '增长动作可执行'],
    prompts: ['总结这个账号的内容套路', '给我 3 个可以复制的动作', '把结论整理成复盘清单']
  },
  '经营顾问': {
    badge: '经营判断',
    objective: '帮助你决定今天该做什么，以及资源优先级。',
    metrics: ['决策更快', '优先级更清晰', '动作可落地'],
    prompts: ['结合我的情况排一下今天优先级', '给我一个一人公司日程表', '如果我只做一件事应该做什么']
  }
};

const DEFAULT_META = {
  badge: 'AI 工作流',
  objective: '围绕当前任务快速产出结果，并继续迭代。',
  metrics: ['结果导向', '可继续追问', '面向执行'],
  prompts: ['继续展开这一版', '帮我总结重点', '换一个更适合发布的版本']
};

// AI聊天页面
Page({
  data: {
    inputValue: '',
    messages: [],
    sending: false,
    lastConversationId: null,
    systemMessages: [],
    title: '',
    chatType: 'general',
    botId: '',
    workflowMeta: DEFAULT_META,
    quickActions: DEFAULT_META.prompts,
    primaryPrompt: DEFAULT_META.prompts[0],
    welcomeText: DEFAULT_META.objective,
    statusBarHeight: 20,
    scrollAnchor: ''
  },

  onLoad: function(options) {
    // 从url参数中获取标题和提示语
    const title = options.title ? decodeURIComponent(options.title) : 'AI助手';
    const prompt = options.prompt ? decodeURIComponent(options.prompt) : '';
    const type = options.type || 'general';
    const botId = options.botId || ''; // 添加botId参数
    
    wx.setNavigationBarTitle({
      title: title
    });

    const workflowMeta = WORKFLOW_META[title] || DEFAULT_META;
    let statusBarHeight = 20;
    try {
      const systemInfo = wx.getSystemInfoSync();
      statusBarHeight = systemInfo.statusBarHeight || 20;
    } catch (e) {
      console.error('获取系统信息失败', e);
    }
    
    this.setData({
      title,
      chatType: type,
      botId,
      workflowMeta,
      quickActions: workflowMeta.prompts.slice(0, 3),
      primaryPrompt: workflowMeta.prompts[0],
      welcomeText: prompt || workflowMeta.objective,
      statusBarHeight,
      scrollAnchor: 'msg-bottom'
    });
    
    const welcomeMessage = prompt || '你好！我是AI助手，有什么可以帮到您的吗？';
    
    // 初始化欢迎消息
    this.setData({
      messages: [
        {
          role: 'assistant',
          content: welcomeMessage,
          time: this.formatTime(new Date()),
          label: '工作流输出'
        }
      ],
      scrollAnchor: 'msg-bottom'
    });
    
    // 自动滚动到底部
    this.scrollToBottom();
  },
  
  // 添加系统消息
  addSystemMessage: function(message, type = 'info') {
    const systemMessages = this.data.systemMessages;
    systemMessages.push({
      content: message,
      type: type,
      time: new Date().toLocaleTimeString()
    });
    
    // 最多保留5条系统消息
    if (systemMessages.length > 5) {
      systemMessages.shift();
    }
    
    this.setData({ systemMessages });
    
    // 5秒后自动清除
    setTimeout(() => {
      const updatedMessages = this.data.systemMessages.filter(msg => msg.content !== message);
      this.setData({ systemMessages: updatedMessages });
    }, 5000);
  },
  
  // 格式化时间 HH:MM
  formatTime: function(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },
  
  // 处理文本框输入
  handleInputChange: function(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  usePromptChip: function(e) {
    const { prompt } = e.currentTarget.dataset;
    if (!prompt || this.data.sending) {
      return;
    }

    this.setData({
      inputValue: prompt
    });
  },
  
  // 发送消息
  sendMessage: function() {
    const { inputValue, messages, botId } = this.data;
    
    // 检查输入是否为空
    if (!inputValue.trim()) {
      this.addSystemMessage('请输入有效内容', 'warning');
      return;
    }
    
    // 添加用户消息
    const updatedMessages = [...messages, {
      role: 'user',
      content: inputValue,
      time: this.formatTime(new Date()),
      label: '你的追问'
    }];
    
    // 清空输入框并更新消息列表
    this.setData({
      messages: updatedMessages,
      inputValue: '',
      sending: true,
      scrollAnchor: 'msg-bottom'
    });
    
    // 自动滚动到底部
    this.scrollToBottom();
    
    // 添加加载中的消息占位
    const loadingMessage = {
      role: 'assistant',
      content: '思考中...',
      isLoading: true,
      time: this.formatTime(new Date()),
      label: '工作流处理中'
    };
    
    this.setData({
      messages: [...updatedMessages, loadingMessage],
      scrollAnchor: 'msg-bottom'
    });
    
    // 调用聊天API获取回复
    this.callChatAPI(inputValue, botId);
  },
  
  // 调用聊天API
  callChatAPI: function(message, botId) {
    // 调用云函数发送消息
    wx.cloud.callFunction({
      name: 'cozeAPIv2',
      data: {
        message: message,
        botId: botId,
        conversation_id: this.data.lastConversationId // 传递上一次的会话ID以保持上下文
      }
    }).then(res => {
      console.log('发送消息成功:', res);
      
      if (res.result && res.result.success) {
        // 保存会话ID
        if (res.result.conversation_id) {
          this.setData({
            lastConversationId: res.result.conversation_id
          });
        }
        
        // 获取最后一条消息，应该是loading状态的
        const { messages } = this.data;
        const lastIndex = messages.length - 1;
        const loadingMessage = messages[lastIndex];
        
        if (!loadingMessage || !loadingMessage.isLoading) return;
        
        // 用回复内容替换加载中的消息
        const updatedMessages = [...messages];
        updatedMessages[lastIndex] = {
          role: 'assistant',
          content: res.result.content || '抱歉，暂时无法回复您的问题',
          images: res.result.images || [],
          time: this.formatTime(new Date()),
          isLoading: false,
          label: '工作流输出'
        };
        
        this.setData({
          messages: updatedMessages,
          sending: false,
          scrollAnchor: 'msg-bottom'
        });
        
        // 自动滚动到底部
        this.scrollToBottom();
      } else {
        this.handleAPIError(res.result ? res.result.error : '发送消息失败');
      }
    }).catch(err => {
      console.error('调用云函数出错:', err);
      this.handleAPIError(err.message || '网络错误，请稍后重试');
    });
  },
  
  // 处理API错误
  handleAPIError: function(errorMsg) {
    console.error('API错误:', errorMsg);
    
    const { messages } = this.data;
    const lastIndex = messages.length - 1;
    const lastMessage = messages[lastIndex];
    
    // 检查最后一条消息是否是加载状态
    if (lastMessage && lastMessage.isLoading) {
      // 替换为错误消息
      const updatedMessages = [...messages];
      updatedMessages[lastIndex] = {
        role: 'assistant',
        content: `抱歉，发生了错误: ${errorMsg}`,
        time: this.formatTime(new Date()),
        isError: true,
        isLoading: false,
        label: '异常提示'
      };
      
      this.setData({
        messages: updatedMessages,
        sending: false,
        scrollAnchor: 'msg-bottom'
      });
    } else {
      // 添加系统错误提示
      this.addSystemMessage(errorMsg, 'error');
      this.setData({ sending: false });
    }
  },
  
  // 滚动到底部
  scrollToBottom: function() {
    this.setData({
      scrollAnchor: ''
    });

    setTimeout(() => {
      this.setData({
        scrollAnchor: 'msg-bottom'
      });
    }, 50);
  },
  
  // 预览图片
  previewImage: function(e) {
    const { index, item } = e.currentTarget.dataset;
    const images = item.images;
    
    if (!images || images.length === 0) return;
    
    const urls = images.map(img => img.url || img.mpUrl);
    const current = urls[index];
    
    wx.previewImage({
      current,
      urls
    });
  }
}); 
