# Learning: feat(miniapp) 支付 V3 实现 + 管理员 OpenID 架构改造

## 任务信息
- Branch: cp-04120229-payment-admin-config
- 关联任务: 195f556a-1b78-4fbf-accc-d954ba071ac8

## 结果
- checkAdmin 改为 DB 动态查询，消除 hardcode OpenID 问题
- createPaymentOrder 实现完整 WeChat Pay V3 API（需配置环境变量）

### 根本原因

#### checkAdmin hardcode 问题
原设计将管理员 OpenID 列表写死在代码中，但 `initDatabase` 云函数已将真实管理员 OpenID
写入 `admins` 集合。两处数据源不一致，且每次新增管理员都需改代码+重新部署。

#### createPaymentOrder mock 问题
mock 版本前端调起 `wx.requestPayment` 时会真实报错（prepay_id 无效），导致支付流程
完全不可用。生产部署前必须接入真实商户。

## 关键实现

#### checkAdmin 改造
- 移除 hardcode OpenID 数组
- 改为 `db.collection('admins').where({ openId }).count()` 动态查询
- 与 `initDatabase` 数据源一致，添加管理员只需向 admins 集合写入文档

#### createPaymentOrder V3 实现
- 支持微信支付 V3 API（RSA2048 签名）
- 4 个云环境变量驱动：`WX_PAY_MCHID` / `WX_PAY_V3_KEY` / `WX_PAY_SERIAL_NO` / `WX_PAY_PRIVATE_KEY`
- 未配置时返回明确错误（不再 mock），防止前端误以为支付正常
- `notify_url` 占位，部署后需更新为云函数 HTTP 触发器地址

### 下次预防
- [ ] 管理员配置永远走 DB，不硬编码 OpenID
- [ ] 支付云函数检测 `isConfigured()` 在初始化时即失败，避免运行时才发现缺配置
- [ ] WX_PAY_PRIVATE_KEY 在微信云控制台中以 Base64 单行存储（去掉 PEM 首尾行）
- [ ] 部署上线前更新 notify_url 为实际的 HTTP 触发器地址

## 待办（需人工操作）
- [ ] 在微信商户平台申请微信支付商户号（https://pay.weixin.qq.com）
- [ ] 下载商户证书，获取 mchid / serial_no / private_key
- [ ] 在 WeChat 云控制台 → 云函数 → createPaymentOrder → 环境变量 中设置 4 个变量
- [ ] 更新 notify_url 为真实回调地址
