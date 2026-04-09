# Learning: copywriter 导航层级修复

## 任务
feat(miniapp): UI全面修缮 — 导航层级优化

## 根本原因

copywriter 流程中 topics→articles 使用 `wx.navigateTo` 会将 articles 页面 push 到导航栈。用户在 topics 和 articles 之间来回切换时（选题→articles→换选题→articles），每次都会新增一个页面层级，最终超过微信小程序 10 层限制导致跳转失败。

## 修复

- `topics.js openArticles()`: `wx.navigateTo` → `wx.redirectTo`（替换当前页，不累积层级）
- `articles.js goBack()`: `wx.navigateBack()` → `wx.redirectTo('/pages/copywriter/topics/topics')`（因 topics 已被 redirectTo 替换，navigateBack 无法回到 topics）

## 下次预防

- [ ] copywriter 这类多步骤"同级"流程页面（topics/articles 互为兄弟）一律用 `redirectTo` 互跳
- [ ] 只有父→子（如 topics→article-detail）才用 `navigateTo`，子→父用 `navigateBack`
- [ ] 新增 copywriter 页面时，先确认它在流程中是"同级"还是"子级"再选择导航方式
