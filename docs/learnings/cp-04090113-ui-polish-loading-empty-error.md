## UI 全面修缮 — 错误/加载/空态/导航优化（2026-04-09）

### 根本原因
copywriter/articles 页面在 `articles` 为空且 `generating` 为 false 时，`wx:for` 渲染空列表，
没有任何提示文案，用户不知道是否需要点击"全部重新生成"。与 topics 页面已有空态 notice 不一致。

### 下次预防
- [ ] 凡有 `wx:for` 列表的页面，需要同时考虑空态（0条）和加载态（请求中）
- [ ] 参考 topics.wxml 空态模式：`<view wx:if="{{!items.length && !generating}}" class="notice">暂无内容，点击重新生成</view>`
- [ ] 代码审查时检查 `wx:for` 旁边是否有 `wx:if` 空态 guard
