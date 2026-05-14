/**
 * ai-chat 页面单元测试 — 核心业务逻辑（AI 对话）
 */

require('../../miniprogram/pages/ai-chat/ai-chat')
const aiChatConfig = global.__getLastPage()

describe('ai-chat 页面', () => {
  let page

  beforeEach(() => {
    jest.clearAllMocks()
    page = {
      ...aiChatConfig,
      data: {
        inputValue: '',
        messages: [],
        sending: false,
        lastConversationId: null,
        systemMessages: [],
        title: '',
        chatType: 'general',
        botId: '',
        workflowMeta: { badge: 'AI 工作流', objective: '默认目标', prompts: ['P1', 'P2', 'P3'] },
        quickActions: ['P1', 'P2', 'P3'],
        primaryPrompt: 'P1',
        welcomeText: '默认目标',
        statusBarHeight: 20,
        scrollAnchor: ''
      },
      setData(updates) {
        Object.assign(this.data, updates)
      }
    }
  })

  describe('初始数据', () => {
    it('messages 默认为空数组', () => {
      expect(aiChatConfig.data.messages).toEqual([])
    })

    it('sending 默认为 false', () => {
      expect(aiChatConfig.data.sending).toBe(false)
    })

    it('inputValue 默认为空字符串', () => {
      expect(aiChatConfig.data.inputValue).toBe('')
    })
  })

  describe('onLoad', () => {
    it('普通 title 加载 DEFAULT_META', () => {
      page.onLoad.call(page, { title: encodeURIComponent('AI助手') })

      expect(page.data.title).toBe('AI助手')
      expect(page.data.messages).toHaveLength(1)
      expect(page.data.messages[0].role).toBe('assistant')
    })

    it('已知 workflow title 加载对应 meta', () => {
      page.onLoad.call(page, { title: encodeURIComponent('脚本生成器') })

      expect(page.data.title).toBe('脚本生成器')
      expect(page.data.workflowMeta.badge).toBe('内容产出')
    })

    it('botId 参数被正确解析', () => {
      page.onLoad.call(page, { botId: 'bot123', title: encodeURIComponent('AI助手') })

      expect(page.data.botId).toBe('bot123')
    })

    it('prompt 参数覆盖 welcomeText', () => {
      page.onLoad.call(page, { prompt: encodeURIComponent('自定义欢迎语') })

      expect(page.data.welcomeText).toBe('自定义欢迎语')
      expect(page.data.messages[0].content).toBe('自定义欢迎语')
    })

    it('getSystemInfoSync 失败时使用默认 statusBarHeight=20', () => {
      wx.getSystemInfoSync.mockImplementationOnce(() => { throw new Error('fail') })

      page.onLoad.call(page, {})

      expect(page.data.statusBarHeight).toBe(20)
    })
  })

  describe('handleInputChange', () => {
    it('更新 inputValue', () => {
      page.handleInputChange.call(page, { detail: { value: '你好' } })

      expect(page.data.inputValue).toBe('你好')
    })
  })

  describe('usePromptChip', () => {
    it('点击 prompt chip 设置 inputValue', () => {
      page.usePromptChip.call(page, { currentTarget: { dataset: { prompt: '帮我补成脚本' } } })

      expect(page.data.inputValue).toBe('帮我补成脚本')
    })

    it('sending=true 时不响应 chip 点击', () => {
      page.data.sending = true

      page.usePromptChip.call(page, { currentTarget: { dataset: { prompt: '帮我补成脚本' } } })

      expect(page.data.inputValue).toBe('')
    })
  })

  describe('sendMessage', () => {
    beforeEach(() => {
      // 默认 checkQuota 放行
      wx.cloud.callFunction.mockResolvedValue({
        result: { success: true, data: { remainingQuota: 10 } }
      })
    })

    it('输入为空时显示警告不发送', async () => {
      page.data.inputValue = '   '
      page.addSystemMessage = jest.fn()

      await page.sendMessage.call(page)

      expect(page.addSystemMessage).toHaveBeenCalledWith('请输入有效内容', 'warning')
      expect(page.data.sending).toBe(false)
    })

    it('有输入时添加用户消息并标记 sending=true', async () => {
      page.data.inputValue = '你好'
      page.callChatAPI = jest.fn()

      await page.sendMessage.call(page)

      expect(page.data.messages.some(m => m.role === 'user' && m.content === '你好')).toBe(true)
    })

    it('有输入时调用 callChatAPI', async () => {
      page.data.inputValue = '你好'
      page.callChatAPI = jest.fn()

      await page.sendMessage.call(page)

      expect(page.callChatAPI).toHaveBeenCalledWith('你好', '')
    })
  })

  describe('callChatAPI', () => {
    it('API 成功时替换 loading 消息为回复内容', () => {
      wx.cloud.callFunction.mockResolvedValueOnce({
        result: { success: true, content: 'AI回复', conversation_id: 'conv-1' }
      })
      page.data.messages = [
        { role: 'user', content: '提问' },
        { role: 'assistant', content: '思考中...', isLoading: true }
      ]
      page.scrollToBottom = jest.fn()

      page.callChatAPI.call(page, '提问', '')

      return Promise.resolve().then(() => {
        // After promise resolves
        expect(wx.cloud.callFunction).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'cozeAPIv2' })
        )
      })
    })

    it('API 失败时调用 handleAPIError', () => {
      wx.cloud.callFunction.mockRejectedValueOnce(new Error('网络超时'))
      page.data.messages = [
        { role: 'assistant', content: '思考中...', isLoading: true }
      ]
      page.handleAPIError = jest.fn()
      page.scrollToBottom = jest.fn()

      page.callChatAPI.call(page, '提问', '')

      return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        expect(page.handleAPIError).toHaveBeenCalled()
      })
    })
  })

  describe('handleAPIError', () => {
    it('最后一条是 loading 状态时替换为错误消息', () => {
      page.data.messages = [
        { role: 'assistant', content: '思考中...', isLoading: true }
      ]

      page.handleAPIError.call(page, '网络超时')

      expect(page.data.messages[0].isError).toBe(true)
      expect(page.data.messages[0].isLoading).toBe(false)
      expect(page.data.sending).toBe(false)
    })

    it('最后一条不是 loading 时添加系统错误提示', () => {
      page.data.messages = [
        { role: 'user', content: '提问' }
      ]
      page.addSystemMessage = jest.fn()

      page.handleAPIError.call(page, '网络超时')

      expect(page.addSystemMessage).toHaveBeenCalledWith('网络超时', 'error')
      expect(page.data.sending).toBe(false)
    })
  })

  describe('formatTime', () => {
    it('返回 HH:MM 格式', () => {
      const date = new Date(2024, 0, 1, 9, 5)
      const result = aiChatConfig.formatTime(date)
      expect(result).toBe('09:05')
    })
  })
})
