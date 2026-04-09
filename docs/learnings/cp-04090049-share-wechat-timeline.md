# Learning: feat(miniapp) 内容分享 — 朋友圈分享支持

## 根本原因

zenithjoy-miniapp 也受 branch-protect.sh hook 保护，直接在主仓库路径编辑会被拦截，必须为该仓库单独创建 worktree 并放置 `.dev-mode` + `.dev-lock` 文件。

## 下次预防

- [ ] miniapp 的代码修改同样需要独立 worktree，不能直接改 /Users/administrator/perfect21/zenithjoy-miniapp/ 下的文件
- [ ] 创建 worktree 后需同时写 `.dev-mode.{branch}` 和 `.dev-lock.{branch}` 两个文件才能解锁 hook
- [ ] onShareTimeline 是独立生命周期方法（不是 onShareAppMessage 的扩展），必须单独实现
- [ ] wx.updateShareMenu 应在 onLoad 最早调用，无需等待文章数据加载完成
