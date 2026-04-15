---
branch: cp-0414-kr3-pay-setup-script
date: 2026-04-14
task: KR3 支付商户号配置 + 管理员 OpenID 替换
---

# Learning: KR3 支付配置 — 代码完成 vs 运营完成的边界

### 根本原因

本任务被 SelfDrive 多次派发（3次 401 失败后重试），核心原因是任务性质被误判为纯代码任务，实际上大部分工作是**运营配置**，而非代码变更。

代码层面（PR #14-#27）早已完成：
- `createPaymentOrder` 从环境变量读取商户凭据
- `checkAdmin` 内置 fallback + DB 动态查询
- `bootstrapAdmin` / `addAdmin` 已部署

阻断的是外部依赖：
1. 微信商户平台开户并获取 MCHID / V3_KEY / SERIAL_NO
2. WeChat Cloud 阻止外部 DB 写入，管理员 OpenID 需 DevTools 手动执行 `bootstrapAdmin`

### 发现

- `~/.credentials/apiclient_key.pem` **已存在**（PKCS#8 格式，PR #kr3 已完成转换）
- 商户私钥已就绪，只缺 3 个从商户平台获取的值：MCHID、V3_KEY、SERIAL_NO
- `write-admin-openid.js` 从外部调用因 WeChat Cloud 权限限制（errcode -501005）会失败

### 下次预防

- [ ] SelfDrive 生成"配置类"任务时，应先检查是否存在外部依赖（第三方账号/控制台操作）
- [ ] 如果任务依赖人工操作（DevTools/商户平台），应标记 `needs_human_review: true` 并在任务描述中列出具体步骤
- [ ] 支付商户开户属于业务前置条件，应在 OKR 层面单独追踪，不应作为代码 dev 任务

### 当前阻断项（人工操作）

1. **支付商户号**：登录 https://pay.weixin.qq.com → 账户中心 → 获取 MCHID + SERIAL_NO + 设置 V3_KEY
2. **管理员 OpenID 入库**：微信开发者工具 → 云开发控制台 → bootstrapAdmin → 本地调用 `{}`
3. **云函数环境变量**：将 4 个支付变量配置到 `createPaymentOrder` 云函数

私钥路径：`~/.credentials/apiclient_key.pem`（可用 `node scripts/setup-credentials.js` 自动预填到 wechat-pay.env）
