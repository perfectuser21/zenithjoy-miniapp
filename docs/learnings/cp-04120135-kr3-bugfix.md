# Learning: KR3 小程序阻断 Bug 清零

**分支**: cp-04120135-kr3-bugfix
**日期**: 2026-04-12

---

## 修复汇总

| Bug | 文件 | 严重级别 |
|-----|------|---------|
| membership.js data 对象语法错误（重复键 expireDateText）| membership.js | P0 |
| checkQuota 误阻断 -1（无限配额）会员 | utils/membership.js | P1 |
| WXML 调用 JS 方法无效（formatDate）| membership.wxml | P1 |
| getArticleDetail 云函数被手动禁用 | cloudfunctions/getArticleDetail | P1 |
| getRecommendArticles 云函数被手动禁用 | cloudfunctions/getRecommendArticles | P1 |

---

### 根本原因

**语法错误**: `cp-04090113-e2e-bug-fix` 分支中在 `data` 对象新增 `expireDateText` 字段时，AI 生成了两行：一行正确值 + 一行空值，且两行之间缺逗号。该分支未被合并，但代码已进入主仓库前一次 PR 的文件中。

**云函数禁用**: 早期某次开发为了避免测试干扰，手动将文章相关云函数返回值改为空/禁用，但没有还原，导致文章功能长期不可用。

---

### 下次预防

- [ ] 每次修改 Page `data` 对象时，用 `node -e "require('./path.js')"` 验证语法
- [ ] 任何"临时禁用"的代码必须加 `// TODO: 恢复` 注释，并在 PR 描述中说明
- [ ] `expireDateText` 这类格式化展示字段，约定在 `setData` 时计算，不在 WXML 中调用函数
- [ ] 配额检查中 `-1 = unlimited` 语义必须在条件里显式排除：`remaining !== -1 && remaining <= 0`
