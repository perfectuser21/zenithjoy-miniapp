## Learning: KR3 小程序 PR #13 合并后收尾

### 根本原因
Brain 任务 "PR #13 合并后收尾" 创建时，后续配置工作（支付商户号 env var 化、管理员 OpenID 配置）被分散到多个独立 PR（#14-#24）中完成。当新 /dev 执行时，代码层面已全部完成，但 Brain KR3 进度未同步更新（仍显示 25%）。

### 下次预防
- [ ] 每个 PR 合并后立即更新 Brain OKR 进度，不积压
- [ ] 配置类任务（env var、bootstrapAdmin 调用）在 checklist 中明确标注"需 CN Mac mini 手动操作"，避免等待
- [ ] 灰度计划状态（阶段 0/1/2/3）应反映在 grayscale-plan.md 中，而非只在脑海中

### 关键事实
- `createPaymentOrder` 商户号已 env var 化，需在 WeChat Dev Tools 云函数控制台配置：`WECHAT_PAY_MCHID`、`WECHAT_PAY_CERT_SERIAL`、`WECHAT_PAY_PRIVATE_KEY`
- 管理员 OpenID 配置：部署后调用 `bootstrapAdmin` 一次即可（或设置 `ADMIN_OPENIDS` env var）
- 阶段1启动操作必须在 CN Mac mini 微信开发者工具完成
