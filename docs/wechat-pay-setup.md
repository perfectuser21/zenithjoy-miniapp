# 微信支付云环境变量配置指南

本指南说明如何为 ZenithJoy 小程序配置微信支付所需的环境变量。

## 所需配置项

| 变量名 | 说明 | 来源 |
|--------|------|------|
| `WX_PAY_MCHID` | 微信支付商户号 | 微信商户平台 → 账户中心 → 商户信息 |
| `WX_PAY_V3_KEY` | 商户 API v3 密钥（32位） | 微信商户平台 → 账户中心 → API安全 |
| `WX_PAY_SERIAL_NO` | 商户 API 证书序列号 | 商户证书文件或微信商户平台 → API安全 |
| `WX_PAY_PRIVATE_KEY` | 商户 API 私钥内容（PEM格式） | 商户证书 `apiclient_key.pem` |

## 配置步骤

### 1. 获取商户信息

1. 登录 [微信商户平台](https://pay.weixin.qq.com)
2. 进入 **账户中心 → 商户信息**，获取 `商户号（MCHID）`
3. 进入 **账户中心 → API安全**：
   - 生成/下载 API 证书（含 `apiclient_cert.p12` / `apiclient_cert.pem` / `apiclient_key.pem`）
   - 设置 **APIv3 密钥**（32位字符串）
   - 记录 **证书序列号**

### 2. 写入本地凭据文件

```bash
# ~/.credentials/wechat-pay.env
WX_PAY_MCHID=1234567890
WX_PAY_V3_KEY=your32bytekeyhere
WX_PAY_SERIAL_NO=ABCDEF1234567890
WX_PAY_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...PEM 内容...
-----END PRIVATE KEY-----"
```

```bash
chmod 600 ~/.credentials/wechat-pay.env
```

### 3. 配置云函数环境变量

在微信开发者工具 → 云开发控制台 → 环境 → 环境变量中添加上述四个变量。

或通过 `createPaymentOrder` 云函数的配置文件注入：

```js
// cloudfunctions/createPaymentOrder/config.js
module.exports = {
  mchid:     process.env.WX_PAY_MCHID,
  v3Key:     process.env.WX_PAY_V3_KEY,
  serialNo:  process.env.WX_PAY_SERIAL_NO,
  privateKey: process.env.WX_PAY_PRIVATE_KEY,
}
```

### 4. 验证配置

```bash
# 检查凭据文件存在
node -e "require('fs').accessSync(require('os').homedir() + '/.credentials/wechat-pay.env')"

# 测试云函数环境（在云开发控制台调用 createPaymentOrder 的 test 入口）
```

## 注意事项

- **私钥不得提交 git**，已在 `.gitignore` 中排除 `*.pem`, `*.p12`
- 证书有效期 5 年，到期前微信会发送提醒邮件
- 沙箱环境商户号与正式环境不同，上线前确认使用正式商户号
- 小程序 AppID 需与商户号绑定（在商户平台 → 产品中心 → AppID 绑定）

## 商户 AppID 绑定检查

```bash
# 当前小程序 AppID
grep "appid" project.config.json
```

确认该 AppID 已在微信商户平台完成绑定，否则支付请求会返回 `APIERROR`。
