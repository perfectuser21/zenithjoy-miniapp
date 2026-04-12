# Learning: KR3 灰度 Phase 1 部署

**分支**: cp-04121640-phase1-deploy  
**日期**: 2026-04-12

### 根本原因

1. `checkAdmin` 云函数缺少代码内置兜底，`bootstrapAdmin` 未调用前管理员功能失效
2. `miniprogram/pages/ai-features/ai-features.wxml` 文件缺失导致 miniprogram-ci 上传报错
3. `miniprogram-ci cloud.uploadFunction` 在 CLI 环境下无法访问云环境（`env not found`），需通过微信开发者工具部署云函数

### 下次预防

- [ ] 新页面创建时确保 .js/.wxml/.wxss/.json 四件套齐全（缺 wxml 会阻断 CI 上传）
- [ ] checkAdmin 有三级 fallback：DB → 环境变量 → 代码内置，启动时无需手动 bootstrapAdmin
- [ ] `miniprogram-ci upload`（前端代码）可从 US Mac mini 自动化执行，但云函数部署需要 CN Mac mini 微信开发者工具
- [ ] 上传完成后需在微信公众平台后台手动"设置为体验版"（不能 API 自动化）
