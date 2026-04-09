# Learning: feat(miniapp): 使用配额强制校验

## 根本原因

miniapp 三个页面（ai-chat、topics、articles）在调用云函数前没有检查用户剩余配额，导致免费用户可以绕过限制无限使用 AI。

## 实现决策

- 提取 `checkQuota()` 到 `utils/membership.js` 共享，而非在三个文件各自实现，避免重复逻辑
- 配额检查失败时 fallback 放行（`catch { return true }`），保证网络异常不影响正常用户
- `sendMessage` 改为 `async function` 以支持 `await checkQuota()`

## 下次预防

- [ ] 新增 AI 调用入口前，检查是否已调用 `checkQuota()`
- [ ] 云函数返回字段变更时，同步更新 `membership.js` 的 `remainingQuota` 读取路径
- [ ] miniapp 新分支开发需先在主仓库创建 `cp-*` 分支，再 `git worktree add` 到 worktree 目录（不能直接在主仓库 cp-* 分支写代码，hook 会阻止）
