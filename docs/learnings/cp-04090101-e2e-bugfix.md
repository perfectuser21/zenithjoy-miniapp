# Learning: 端到端集成验证发现的两个静默 Bug

## 根本原因

### Bug 1: article-list 路径不一致
`openArticleLibrary()` 中写的是 `/pages/article-list/index`，而 app.json 注册的页面路径是 `pages/article-list/article-list`。微信小程序页面路径必须与 app.json 完全一致，否则 `wx.navigateTo` 会静默失败（无报错但不跳转）。

### Bug 2: checkQuota 调用不存在的云函数
`utils/membership.js` 中 `checkQuota()` 调用 `getUserMembership` 云函数，但该云函数从未部署，正确名称是 `checkMembership`。由于 `catch` 块返回 `true`（放行），所有配额=0 的用户都不会收到升级提示，配额限制完全失效。

## 下次预防

- [ ] 新增页面时，先确认 app.json 里的注册路径，再写跳转 URL — 不要凭文件名猜
- [ ] 云函数调用要和 `cloudfunctions/` 目录名完全一致，统一做一次命名梳理
- [ ] 静默失败（catch 放行）的代码要在集成测试中重点检查，因为单元测试看不出来
