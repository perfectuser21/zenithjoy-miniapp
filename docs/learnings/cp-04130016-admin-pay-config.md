### 根本原因

**问题 1 — checkAdmin 移除 fallback 导致功能 broken**:
PR #16 将 `checkAdmin` 改为纯 DB 查询，同时移除了环境变量 fallback。若 `admins` 集合为空（首次部署），所有用户的 `isAdmin` 均返回 false，管理功能完全失效。需要保留 fallback。

**问题 2 — WeChat Cloud HTTP API 权限受限**:
尝试通过 `POST /tcb/databaseadd` 从外部写入云数据库，返回 `-501005/INVALID_ENV`。原因：微信小程序 AppID 的 `access_token` 无法操作云数据库——需要 CloudBase 服务账号权限或在云函数内部操作。

**问题 3 — 支付商户号凭据缺失**:
`createPaymentOrder` 代码实现完整（V3 JSAPI），但 1Password 中没有商户号凭据（未开通或未录入）。

### 下次预防

- [ ] **首次部署 checklist 增加"调用 bootstrapAdmin"步骤**
- [ ] **checkAdmin 永远保留环境变量 fallback**：DB 是主路径，env var 是安全网
- [ ] **微信 Cloud HTTP API 能力边界**：从外部写云数据库需要 CloudBase 服务账号，普通 AppID token 不够
- [ ] **支付商户号需提前申请**：pay.weixin.qq.com 注册 + 主体认证，配置后存 1Password
- [ ] 新建云函数时同步创建 `package.json`（wx-server-sdk 依赖）
