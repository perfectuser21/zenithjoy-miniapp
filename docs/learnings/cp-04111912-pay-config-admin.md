# Learning: feat(miniapp) 支付商户号配置 + 管理员 OpenID 更新

## 任务信息
- Branch: cp-04111912-pay-config-admin
- Brain Task: 195f556a-1b78-4fbf-accc-d954ba071ac8
- 完成时间: 2026-04-11

## 结果
createPaymentOrder 从 mock 版本升级为 WeChat Pay v3 API 真实实现；checkAdmin 移除误导性注释并支持环境变量动态扩展管理员列表。

### 根本原因
原 createPaymentOrder 为 mock 实现，生产支付无法使用。原 checkAdmin 有误导性注释，但内置 OpenID 是真实迁移值。

## 关键实现

### createPaymentOrder（WeChat Pay v3 API）
- 使用 Node.js 内置 `crypto` + `https`，无需新增依赖
- MCHID / CERT_SERIAL / PRIVATE_KEY 全部从 `process.env` 读取
- 签名算法：WECHATPAY2-SHA256-RSA2048（v3 标准）
- wx.requestPayment signType 从 MD5 改为 RSA（v3 要求）
- 未配置环境变量时返回明确错误，不 crash

### checkAdmin
- 保留 `o2lLz62X0iyQEYcpnS2ljUvXlHF0`（初始迁移的真实管理员 OpenID）
- 新增 `ADMIN_OPENIDS` 环境变量支持，逗号分隔，无需重新部署即可扩展管理员

## 下次预防

- [x] 生产凭据统一走环境变量，不硬编码在代码里
- [x] WeChat Pay v3 signType 必须是 RSA，不是 MD5（v2 遗留问题）
- [x] cloud function 环境变量在微信云开发控制台「云函数 → 函数配置 → 环境变量」中设置：
  - `WECHAT_PAY_MCHID` — 商户号
  - `WECHAT_PAY_CERT_SERIAL` — API 证书序列号
  - `WECHAT_PAY_PRIVATE_KEY` — API 私钥（PEM 完整内容）
  - `ADMIN_OPENIDS` — 可选，额外管理员 OpenID（逗号分隔）
