## feat(miniapp): heroCard 云数据库动态加载（2026-04-09）

### 根本原因
heroCard 数据为硬编码静态值，运营无法在不发版的情况下更新首页提示卡内容。

### 下次预防
- [ ] 新增静态内容字段时，评估是否需要云数据库驱动（运营是否需要动态更新）
- [ ] miniapp 独立 git 仓库，改动需在 zenithjoy-miniapp worktree 中执行（非 cecelia worktree）
