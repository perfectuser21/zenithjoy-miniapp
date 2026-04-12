# ZenithJoy 小程序上线前 Checklist

**版本**: 2.0
**日期**: 2026-04-12
**状态**: 🟡 进行中（代码完成度 ~85%，待真机测试 + 提审）

---

## 一、功能验证（核心路径）

### 1.1 首页
- [x] 首页正常渲染，4 个 Tab 可切换（首页/创作/AI助理/我的）
- [x] heroCard 从云数据库动态加载（PR #2 已完成）
- [x] 创作工具卡片点击跳转正确（AI chat / copywriter / 文章列表）

### 1.2 AI 聊天（ai-chat 页面）
- [x] 4 个 bot 可正常进入（脚本生成器/选题策划师/对标分析/经营顾问）
- [x] 发送消息后 AI 有响应（云函数 `cozeAPIv2` 可调通）
- [x] 配额耗尽时弹出升级引导（PR #5 已完成 quota 强制校验）
- [x] 无限配额会员（remainingQuota = -1）不被拦截（PR #11 已修复）

### 1.3 文案创作（Copywriter 流程）
- [x] Start → Keywords → Ideas → Profile → Topics → Articles 完整流程可走通
- [x] Topics 页面 AI 生成选题（checkQuota → generateTopicsWithAI）
- [x] 锁定选题后重新生成，锁定项保留（PR #6 已修复）
- [x] Articles 页面 AI 生成文章内容
- [x] 跳转路径：topics → articles 使用 `redirectTo`（PR #7 已修复）

### 1.4 文章库
- [x] 文章列表页正常加载（云函数 `getRecommendArticles` PR #13 已恢复）
- [x] 文章详情页正常显示（云函数 `getArticleDetail` PR #13 已恢复）
- [x] 外部链接文章通过 web-view 打开
- [x] 分享文章功能正常（PR #9 分享按钮已修复）

### 1.5 会员中心
- [x] 会员页面正常打开（`membership.js` 语法错误 PR #13 已修复）
- [x] 会员到期时间正确显示（使用 `expireDateText`，非 WXML 函数调用）
- [x] 今日使用次数和剩余次数正确展示
- [x] 使用记录列表正常加载
- [x] 会员套餐列表正常加载（`membership_plans` 集合）

### 1.6 支付流程
- [x] 点击"升级会员"调起微信支付（PR #3 支付集成已完成，PR #14/#16 商户号配置）
- [ ] **待验证** 支付成功后会员状态刷新（需真机 + 沙盒环境联调）
- [ ] **待验证** 支付取消不报错（需真机测试）

### 1.7 用户页面
- [x] 用户信息正常展示（本地缓存 userInfo）
- [x] 清除缓存功能正常
- [x] 管理员账号进入后台（checkAdmin 动态查询 admins 集合，PR #16）

---

## 二、兼容性测试

### 2.1 设备覆盖
- [ ] **待测** iPhone 14/15（iOS 16+）
- [ ] **待测** iPhone SE（小屏，iOS 15+）
- [ ] **待测** Android 主流机型（华为/小米/OPPO/vivo）
- [ ] 平板适配基本可用（低优先级）

### 2.2 网络环境
- [ ] **待测** 4G 网络下首屏加载 < 3s
- [ ] **待测** WiFi 下所有操作响应 < 1s
- [ ] **待测** 弱网（2G/3G）下有 loading 状态和错误提示

### 2.3 微信版本
- [ ] **待测** 微信 8.0.40+（最低支持版本）
- [ ] **待测** 微信最新正式版

---

## 三、性能基准

| 页面 | 首次加载目标 | 验证方式 |
|------|------------|---------|
| 首页 | < 1.5s | 微信性能监控面板 |
| AI 聊天 | < 1s | 秒表计时 |
| 文章列表 | < 2s | 微信性能监控面板 |
| 会员中心 | < 1s | 秒表计时 |

**包体积**: < 2MB（微信小程序限制 8MB，分包暂不需要）

- [ ] **待测** 性能基准验收（微信开发者工具 Audits）

---

## 四、云函数状态确认

| 云函数 | 状态 | 备注 |
|--------|------|------|
| `cozeAPIv2` | ✅ 代码就绪 | AI 对话引擎 |
| `checkMembership` | ✅ 代码就绪 | 配额 + 会员状态 |
| `userLogin` | ✅ 代码就绪 | 用户初始化 |
| `checkAdmin` | ✅ 代码就绪 | DB 查询 + 环境变量 fallback（ADMIN_OPENIDS）；PR #20 已新增 bootstrapAdmin |
| `getRecommendArticles` | ✅ 代码就绪 | PR #13 恢复 |
| `getArticleDetail` | ✅ 代码就绪 | PR #13 恢复 |
| `createPaymentOrder` | ⚠️ 需配置 | 代码就绪（V3 签名），待商户号 env var 注入 |
| `getUsageRecords` | ✅ 代码就绪 | 7 天使用统计 |
| `initDatabase` | ✅ 代码就绪 | 部署后手动触发一次 |
| `bootstrapAdmin` | ✅ 新增 | PR #20，首次部署后调用一次，调用者成为管理员 |
| `addAdmin` | ✅ 新增 | PR #20，运维工具，由现有管理员添加新管理员 |

> ⚠️ 所有云函数需通过微信开发者工具上传部署到 `zenithjoycloud-8g4ca5pbb5b027e8`

---

## 五、上线前配置确认

- [x] 微信小程序 AppID 已填写（`project.config.json`：`wx98c067e00cce09da`）
- [x] 云环境 ID 正确（`zenithjoycloud-8g4ca5pbb5b027e8`，`app.js` 中已配置）
- [ ] **待操作** 管理员 OpenID 配置：在 Dev Tools 调用 `bootstrapAdmin`，**或** 给 `checkAdmin` 设置环境变量 `ADMIN_OPENIDS=o2lLz62X0iyQEYcpnS2ljUvXlHF0`
- [ ] **待操作** 支付商户号配置（详见 `docs/wechat-pay-setup.md`，需要微信商户平台开户）
- [x] `sitemap.json` 无索引配置问题（允许全部页面）

---

## 六、审核提交前确认

- [x] 隐私协议弹窗已添加（index.js 底部弹窗 + `__usePrivacyVersion__: true`，PR #18）
- [ ] **待配置** 小程序名称/图标/描述已填写（微信公众平台手动操作）
- [ ] **待配置** 服务类目已选择（工具类 / AI 助手，微信公众平台手动操作）
- [x] 无未声明的权限调用（app.json 已声明 getUserInfo + getLocation）
- [ ] **待测** 体验版已通过核心流程测试（至少 3 人以上）

---

## 七、上线阻断项（P0）— 全部解决后可提审

| # | 问题 | 状态 | 解决方案 |
|---|------|------|---------|
| 1 | 云函数未部署到生产环境 | ⏳ 待操作 | 开发者工具逐一上传 9 个云函数 |
| 2 | 支付沙盒测试未通过 | ⏳ 待操作 | 真机 + 商户号沙盒环境联调 |
| 3 | 真机兼容性测试 | ⏳ 待操作 | iOS + Android 各 1 台扫码测试 |
| 4 | 微信平台信息未填写 | ⏳ 待操作 | 公众平台设置名称/图标/分类 |

---

## 八、灰度上线操作步骤

1. `git checkout main && git pull origin main`（确保本地与最新一致）
2. 微信开发者工具打开 `/Users/administrator/perfect21/zenithjoy-miniapp`
3. 上传所有云函数到生产环境（9 个，逐一右键 → 上传部署）
4. 手动触发 `initDatabase` 一次
5. 手机扫码预览 → 核心流程测试（参考第一节各条目）
6. 开发者工具 → 上传 → 填写版本描述 → 设为体验版
7. 邀请 5-10 人内测（公众平台 → 成员管理 → 体验成员）
8. 内测无 P0 bug → 提交审核
