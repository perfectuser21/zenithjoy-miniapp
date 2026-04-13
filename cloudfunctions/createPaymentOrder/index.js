// createPaymentOrder 云函数
// 微信支付 V3 统一下单
//
// 所需云环境变量（在微信云控制台 → 云函数 → 环境变量中配置）：
//   WX_PAY_MCHID        - 商户号（10位数字）
//   WX_PAY_V3_KEY       - APIv3 密钥（32字节）
//   WX_PAY_SERIAL_NO    - 商户证书序列号
//   WX_PAY_PRIVATE_KEY  - 商户私钥（PKCS#8 PEM，去掉首尾行）
//   WX_PAY_NOTIFY_URL   - 支付回调 URL（部署 notifyPayment 并创建 HTTP 触发器后填入）
//                         格式：https://zenithjoycloud-8g4ca5pbb5b027e8.service.tcloudbase.com/notifyPayment
const cloud = require('wx-server-sdk');
const crypto = require('crypto');
const https = require('https');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// ─── 配置读取 ───────────────────────────────────────────────────────────────
const MCHID      = process.env.WX_PAY_MCHID;
const V3_KEY     = process.env.WX_PAY_V3_KEY;
const SERIAL_NO  = process.env.WX_PAY_SERIAL_NO;
const PRIVATE_KEY_RAW = process.env.WX_PAY_PRIVATE_KEY;
// 支付回调 URL（部署 notifyPayment 云函数并设置 HTTP 触发器后配置此环境变量）
const NOTIFY_URL = process.env.WX_PAY_NOTIFY_URL ||
  'https://zenithjoycloud-8g4ca5pbb5b027e8.service.tcloudbase.com/notifyPayment';

function isConfigured() {
  return !!(MCHID && V3_KEY && SERIAL_NO && PRIVATE_KEY_RAW);
}

function getPrivateKey() {
  return `-----BEGIN PRIVATE KEY-----\n${PRIVATE_KEY_RAW}\n-----END PRIVATE KEY-----`;
}

// ─── 微信支付 V3 签名 ───────────────────────────────────────────────────────
function buildSignMessage(method, url, timestamp, nonce, body) {
  return [method, url, timestamp, nonce, body, ''].join('\n');
}

function sign(message) {
  const privateKey = getPrivateKey();
  return crypto.createSign('sha256WithRSAEncryption')
    .update(message)
    .sign(privateKey, 'base64');
}

function buildAuthorization(method, url, body) {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = crypto.randomBytes(16).toString('hex');
  const message = buildSignMessage(method, url, timestamp, nonce, body || '');
  const signature = sign(message);
  return `WECHATPAY2-SHA256-RSA2048 mchid="${MCHID}",nonce_str="${nonce}",timestamp="${timestamp}",serial_no="${SERIAL_NO}",signature="${signature}"`;
}

// ─── JSAPI 支付签名（前端调起支付用）──────────────────────────────────────
function signForJsapi(prepayId) {
  const appId = cloud.getWXContext().APPID;
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = crypto.randomBytes(16).toString('hex');
  const pkg = `prepay_id=${prepayId}`;
  const message = [appId, timestamp, nonce, pkg, ''].join('\n');
  const paySign = sign(message);
  return { timeStamp: timestamp, nonceStr: nonce, package: pkg, signType: 'RSA', paySign };
}

// ─── 调用微信支付统一下单接口 ───────────────────────────────────────────────
function callWxPayApi(path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const method = 'POST';
    const url = path;
    const auth = buildAuthorization(method, url, bodyStr);
    const options = {
      hostname: 'api.mch.weixin.qq.com',
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': auth,
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('解析微信支付响应失败: ' + data)); }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// ─── 主入口 ─────────────────────────────────────────────────────────────────
exports.main = async (event) => {
  const { planId } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const appId = wxContext.APPID;

  if (!planId) {
    return { success: false, error: '缺少套餐参数 planId' };
  }

  if (!isConfigured()) {
    console.error('createPaymentOrder: 微信支付商户号未配置，请在云函数环境变量中设置 WX_PAY_MCHID/WX_PAY_V3_KEY/WX_PAY_SERIAL_NO/WX_PAY_PRIVATE_KEY');
    return { success: false, error: '支付功能暂未开放，请联系管理员' };
  }

  // 1. 查询套餐金额
  const planResult = await db.collection('membership_plans').where({ id: planId }).get();
  if (planResult.data.length === 0) {
    return { success: false, error: '套餐不存在: ' + planId };
  }
  const plan = planResult.data[0];
  const totalFee = Math.round(plan.price * 100); // 转为分

  // 2. 调用微信支付 V3 JSAPI 统一下单
  const outTradeNo = `ZJ${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const reqBody = {
    appid: appId,
    mchid: MCHID,
    description: `ZenithJoy ${plan.name}`,
    out_trade_no: outTradeNo,
    notify_url: NOTIFY_URL,
    amount: { total: totalFee, currency: 'CNY' },
    payer: { openid }
  };

  const resp = await callWxPayApi('/v3/pay/transactions/jsapi', reqBody);

  if (!resp.prepay_id) {
    console.error('统一下单失败', resp);
    return { success: false, error: resp.message || '下单失败', code: resp.code };
  }

  // 3. 签名给前端调起支付
  const jsapiParams = signForJsapi(resp.prepay_id);

  return {
    success: true,
    outTradeNo,
    ...jsapiParams
  };
};

