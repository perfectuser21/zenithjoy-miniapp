# Learning: 内容分享功能 — 按钮文字一致性

## 任务
feat(miniapp): 内容分享功能 — 文章分享到朋友圈

### 根本原因
PR #4 实现了完整的分享逻辑（onShareAppMessage/onShareTimeline），但 WXML 按钮文字写的是"分享文章"，与 PRD 要求的"分享给好友"不一致。功能实现和 UI 文案不同步。

### 下次预防
- [ ] PRD 明确指定按钮文字时，代码实现前对照 PRD 原文检查 WXML 文案
- [ ] share 类 PR review 时检查：按钮文字是否与分享类型（好友 vs 朋友圈）语义匹配
- [ ] 朋友圈分享无法通过按钮触发（只能顶部菜单），不要在 UI 上添加"分享到朋友圈"按钮
