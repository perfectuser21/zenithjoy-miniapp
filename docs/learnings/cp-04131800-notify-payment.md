# Learning: notifyPayment 云函数 + notify_url 修复

**分支**: cp-04131800-kr3-notify-payment
**日期**: 2026-04-13
**任务**: Brain task 4caead7b — KR3小程序支付商户号配置

---

### 根本原因

PR#14 实现 createPaymentOrder 时 `notify_url` 写成了 `https://api.mch.weixin.qq.com/v3/pay/notify/${MCHID}`，
这是微信支付自己的 API 域名，而不是商户方的回调地址。
结果：支付成功后微信会向自己的服务器发 POST，永远 404，会员状态永远无法被自动激活。

### 修复

1. 新增 `cloudfunctions/notifyPayment/index.js`：
   - AES-256-GCM 解密微信支付 V3 通知体
   - 验证 `event_type === 'TRANSACTION.SUCCESS'`
   - 调用 `activateMembership()` 更新 `memberships` 集合 + 写 `payment_records`
   - 支持续费叠加（未过期时在到期日基础上延长）

2. `createPaymentOrder` 改用 `NOTIFY_URL` 常量：
   - 优先读环境变量 `WX_PAY_NOTIFY_URL`
   - 默认值 `https://zenithjoycloud-8g4ca5pbb5b027e8.service.tcloudbase.com/notifyPayment`

### 下次预防

- [ ] 未来新增云函数时先检查是否有对应的 HTTP 触发器需求
- [ ] notify_url 不得指向 `api.mch.weixin.qq.com`（是 WeChat 的 API，不是商户回调）
- [ ] 部署 notifyPayment 后必须在云开发控制台激活 HTTP 触发器

### 手动操作（部署后必做）

1. 在微信开发者工具 → 云开发控制台 → 云函数 → notifyPayment → 创建 HTTP 触发器
2. 获取实际 URL（通常为 `https://zenithjoycloud-8g4ca5pbb5b027e8.service.tcloudbase.com/notifyPayment`）
3. 在 createPaymentOrder 云函数环境变量中设置 `WX_PAY_NOTIFY_URL` = 实际 URL
