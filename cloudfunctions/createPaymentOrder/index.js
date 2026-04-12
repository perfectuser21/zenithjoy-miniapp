// createPaymentOrder 云函数 — 微信支付 v3 JSAPI 统一下单
// 凭据通过云函数环境变量注入（微信云开发控制台配置）：
//   WECHAT_PAY_MCHID        — 商户号（如：1234567890）
//   WECHAT_PAY_CERT_SERIAL  — API 证书序列号（微信支付平台获取）
//   WECHAT_PAY_PRIVATE_KEY  — API 证书私钥（PEM 格式，含 BEGIN/END RSA PRIVATE KEY）
const cloud = require('wx-server-sdk');
const https = require('https');
const crypto = require('crypto');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const APPID = 'wx98c067e00cce09da';
const MCHID = process.env.WECHAT_PAY_MCHID;
const CERT_SERIAL = process.env.WECHAT_PAY_CERT_SERIAL;
const PRIVATE_KEY = process.env.WECHAT_PAY_PRIVATE_KEY;

function generateNonce() {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
}

function generateTimestamp() {
  return String(Math.floor(Date.now() / 1000));
}

function signMessage(message) {
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(message, 'utf8');
  return sign.sign(PRIVATE_KEY, 'base64');
}

function buildAuthHeader(method, urlPath, body) {
  const timestamp = generateTimestamp();
  const nonce = generateNonce();
  const message = [method, urlPath, timestamp, nonce, body].join('\n') + '\n';
  const signature = signMessage(message);
  return `WECHATPAY2-SHA256-RSA2048 mchid="${MCHID}",nonce_str="${nonce}",timestamp="${timestamp}",serial_no="${CERT_SERIAL}",signature="${signature}"`;
}

function httpsPost(path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const authorization = buildAuthHeader('POST', path, bodyStr);

    const options = {
      hostname: 'api.mch.weixin.qq.com',
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ZenithJoy-MiniApp/1.0',
        Authorization: authorization
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (_) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

exports.main = async (event) => {
  const { planId } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!planId) {
    return { success: false, error: '缺少套餐参数 planId' };
  }

  if (!MCHID || !CERT_SERIAL || !PRIVATE_KEY) {
    console.error('[createPaymentOrder] 环境变量未配置: WECHAT_PAY_MCHID / WECHAT_PAY_CERT_SERIAL / WECHAT_PAY_PRIVATE_KEY');
    return { success: false, error: '支付服务暂时不可用，请联系客服' };
  }

  if (!openid) {
    return { success: false, error: '无法获取用户身份，请重新登录' };
  }

  const db = cloud.database();

  let plan;
  try {
    const planResult = await db.collection('membership_plans').where({ id: planId }).get();
    if (!planResult.data || planResult.data.length === 0) {
      return { success: false, error: '套餐不存在' };
    }
    plan = planResult.data[0];
  } catch (err) {
    console.error('[createPaymentOrder] 查询套餐失败:', err.message);
    return { success: false, error: '套餐查询失败' };
  }

  const totalFee = Math.round(plan.price * 100); // 转为分
  if (totalFee <= 0) {
    return { success: false, error: '免费套餐无需支付' };
  }

  // 生成商户订单号（ZJ + 时间戳 + 3位随机数）
  const outTradeNo = `ZJ${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  const orderBody = {
    appid: APPID,
    mchid: MCHID,
    description: `ZenithJoy - ${plan.name}`,
    out_trade_no: outTradeNo,
    notify_url: 'https://api.weixin.qq.com/cgi-bin/cloudbase/paidunion',
    amount: { total: totalFee, currency: 'CNY' },
    payer: { openid }
  };

  let apiResult;
  try {
    apiResult = await httpsPost('/v3/pay/transactions/jsapi', orderBody);
  } catch (err) {
    console.error('[createPaymentOrder] 请求微信支付 API 失败:', err.message);
    return { success: false, error: '创建订单失败，请稍后重试' };
  }

  if (apiResult.statusCode !== 200 || !apiResult.body.prepay_id) {
    const errMsg = (apiResult.body && (apiResult.body.message || apiResult.body.err_code_des)) || '下单失败';
    console.error('[createPaymentOrder] 微信支付下单失败:', JSON.stringify(apiResult.body));
    return { success: false, error: errMsg };
  }

  // 生成 wx.requestPayment 所需签名
  const timestamp = generateTimestamp();
  const nonce = generateNonce();
  const pkg = `prepay_id=${apiResult.body.prepay_id}`;
  const paySignMessage = [APPID, timestamp, nonce, pkg].join('\n') + '\n';
  const paySign = signMessage(paySignMessage);

  return {
    success: true,
    timeStamp: timestamp,
    nonceStr: nonce,
    package: pkg,
    signType: 'RSA',
    paySign
  };
};
