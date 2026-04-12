# ZenithJoy 小程序上线前 Checklist

**版本**: 1.0
**日期**: 2026-04-12

---

## 一、功能验证（核心路径）

### 1.1 首页
- [ ] 首页正常渲染，4 个 Tab 可切换（首页/创作/AI助理/我的）
- [ ] heroCard 从云数据库动态加载（无默认占位）
- [ ] 创作工具卡片点击跳转正确（AI chat / copywriter / 文章列表）

### 1.2 AI 聊天（ai-chat 页面）
- [ ] 4 个 bot 可正常进入（脚本生成器/选题策划师/对标分析/经营顾问）
- [ ] 发送消息后 AI 有响应（云函数 `cozeAPIv2` 可调通）
- [ ] 配额耗尽时弹出升级引导（非 -1 且 <= 0 时触发）
- [ ] 无限配额会员（remainingQuota = -1）不被拦截

### 1.3 文案创作（Copywriter 流程）
- [ ] Start → Keywords → Ideas → Profile → Topics → Articles 完整流程可走通
- [ ] Topics 页面 AI 生成选题（checkQuota → generateTopicsWithAI）
- [ ] 锁定选题后重新生成，锁定项保留
- [ ] Articles 页面 AI 生成文章内容
- [ ] 跳转路径：topics → articles 使用 `redirectTo`（避免层级累积）

### 1.4 文章库
- [ ] 文章列表页正常加载（云函数 `getRecommendArticles` 返回数据）
- [ ] 文章详情页正常显示（云函数 `getArticleDetail` 返回数据）
- [ ] 外部链接文章通过 web-view 打开
- [ ] 分享文章功能正常

### 1.5 会员中心
- [ ] 会员页面正常打开（`membership.js` 语法错误已修复）
- [ ] 会员到期时间正确显示（使用 `expireDateText`，非 WXML 函数调用）
- [ ] 今日使用次数和剩余次数正确展示
- [ ] 使用记录列表正常加载
- [ ] 会员套餐列表正常加载（`membership_plans` 集合）

### 1.6 支付流程
- [ ] 点击"升级会员"调起微信支付（需商户号配置）
- [ ] 支付成功后会员状态刷新
- [ ] 支付取消不报错

### 1.7 用户页面
- [ ] 用户信息正常展示（本地缓存 userInfo）
- [ ] 清除缓存功能正常
- [ ] 管理员账号进入后台（admin OpenID 已配置）

---

## 二、兼容性测试

### 2.1 设备覆盖
- [ ] iPhone 14/15（iOS 16+）
- [ ] iPhone SE（小屏，iOS 15+）
- [ ] Android 主流机型（华为/小米/OPPO/vivo）
- [ ] 平板适配基本可用

### 2.2 网络环境
- [ ] 4G 网络下首屏加载 < 3s
- [ ] WiFi 下所有操作响应 < 1s
- [ ] 弱网（2G/3G）下有 loading 状态和错误提示

### 2.3 微信版本
- [ ] 微信 8.0.40+（最低支持版本）
- [ ] 微信最新正式版

---

## 三、性能基准

| 页面 | 首次加载目标 | 验证方式 |
|------|------------|---------|
| 首页 | < 1.5s | 微信性能监控面板 |
| AI 聊天 | < 1s | 秒表计时 |
| 文章列表 | < 2s | 微信性能监控面板 |
| 会员中心 | < 1s | 秒表计时 |

**包体积**: < 2MB（微信小程序限制 8MB，分包暂不需要）

---

## 四、云函数状态确认

| 云函数 | 状态 | 备注 |
|--------|------|------|
| `cozeAPIv2` | ✅ 正常 | AI 对话引擎 |
| `checkMembership` | ✅ 正常 | 配额 + 会员状态 |
| `userLogin` | ✅ 正常 | 用户初始化 |
| `checkAdmin` | ✅ 已配置 | admins 集合动态查询，OpenID 已通过 write-admin-openid.js 写入 |
| `getRecommendArticles` | ✅ 已修复 | 本 PR 恢复（原被禁用）|
| `getArticleDetail` | ✅ 已修复 | 本 PR 恢复（原被禁用）|
| `createPaymentOrder` | ⚠️ 需配置 | 详见 docs/wechat-pay-setup.md |
| `getUsageRecords` | ✅ 正常 | 7 天使用统计 |
| `initDatabase` | ✅ 正常 | 初始化，部署时手动触发一次 |

---

## 五、上线前配置确认

- [ ] 微信小程序 AppID 已填写（`project.config.json`）
- [ ] 云环境 ID 正确（生产环境）
- [x] `checkAdmin` 中管理员 OpenID 已配置（admins 集合 + write-admin-openid.js）
- [ ] 支付商户号配置完成（详见 docs/wechat-pay-setup.md）
- [ ] `sitemap.json` 无索引配置问题

---

## 六、审核提交前确认

- [ ] 隐私协议页面或弹窗已添加
- [ ] 小程序名称/图标/描述已填写
- [ ] 服务类目已选择（工具类 / AI 助手）
- [ ] 无未声明的权限调用（位置权限仅在需要时触发）
- [ ] 体验版已通过核心流程测试（至少 3 人以上）
