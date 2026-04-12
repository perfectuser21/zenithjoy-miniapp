---
branch: cp-04120430-privacy-policy-popup
date: 2026-04-12
task: feat(miniapp): 隐私协议弹窗 — 微信审核强制要求
---

# Learning: 微信小程序隐私协议弹窗实现

### 根本原因

微信从基础库 2.33.0 起，要求小程序在调用涉及用户隐私的 API 前，必须：
1. 在 `app.json` 中声明 `"__usePrivacyVersion__": true`（表示自己处理隐私弹窗）
2. 注册 `wx.onNeedPrivacyAuthorization` 回调
3. 用户同意后调用 `wx.agreePrivacyAuthorization`

未实现此机制的小程序无法通过微信审核，是 KR3 上线的 P0 阻断项。

### 下次预防

- [ ] 新建微信小程序时，隐私协议必须在第一个 PR 中同步实现，不能留到最后
- [ ] `wx.onNeedPrivacyAuthorization` 在 app.js 中注册，但通知逻辑由当前页面处理（页面需暴露 `showPrivacyModal()` 方法）
- [ ] `wx.getPrivacySetting` 可在首次加载时主动检查是否需要弹出（不等用户触发 API）
- [ ] 隐私协议页面 URL 需要是已备案的域名（本实现跳转 web-view 到 zenithjoy.cc/privacy）

### 实现细节

**三件套**：
1. `app.js`: `wx.onNeedPrivacyAuthorization(resolve => ...)` — 存储 resolve，通知当前页面
2. `pages/index/index.js`: `checkPrivacySetting()` + `showPrivacyModal()` + `agreePrivacy()` + `disagreePrivacy()`
3. `pages/index/index.wxml` + `index.wxss`: 底部弹窗 UI（遮罩 + 弹窗 + 同意/拒绝按钮）

**注意**：拒绝时不能退出小程序（微信不允许），改为提示"需要同意才能使用"并重新显示弹窗
