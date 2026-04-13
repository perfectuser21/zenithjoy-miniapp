// notifyPayment 云函数 — 微信支付 V3 支付结果通知处理器
//
// 部署说明：
//   1. 在微信云开发控制台部署此云函数后，为其创建 HTTP 触发器
//   2. 将 HTTP 触发器 URL 写入云函数环境变量 WX_PAY_NOTIFY_URL
//   3. createPaymentOrder 会自动读取该环境变量作为 notify_url
//
// HTTP 触发器 URL 示例（部署后在控制台获取实际路径）：
//   https://zenithjoycloud-8g4ca5pbb5b027e8.service.tcloudbase.com/notifyPayment
//
// 微信支付 V3 通知协议（文档：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_5.shtml）：
//   POST body: { id, event_type, resource: { algorithm, ciphertext, nonce, associated_data } }
//   解密后得到 transaction 对象，含 out_trade_no / openid / trade_state 等

const cloud = require('wx-server-sdk');
const crypto = require('crypto');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const V3_KEY = process.env.WX_PAY_V3_KEY;

// ─── AES-256-GCM 解密微信支付通知体 ────────────────────────────────────────
function decryptNotification(ciphertext, nonce, associatedData) {
  if (!V3_KEY) throw new Error('WX_PAY_V3_KEY 未配置');
  const key = Buffer.from(V3_KEY, 'utf8');
  const ciphertextBuf = Buffer.from(ciphertext, 'base64');
  // GCM auth tag 是密文末尾 16 字节
  const authTag = ciphertextBuf.slice(-16);
  const encrypted = ciphertextBuf.slice(0, -16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(nonce, 'utf8'));
  decipher.setAuthTag(authTag);
  decipher.setAAD(Buffer.from(associatedData || '', 'utf8'));
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

// ─── 根据金额（分）推断套餐天数 ─────────────────────────────────────────────
function getDurationDays(totalFee) {
  if (totalFee >= 19800) return 365;  // ¥198 年套餐
  if (totalFee >= 9800)  return 180;  // ¥98  半年套餐
  return 30;                          // ¥29.8 月套餐（默认）
}

// ─── 激活/续费用户会员状态 ──────────────────────────────────────────────────
async function activateMembership(openid, transaction) {
  const { out_trade_no, amount } = transaction;
  const totalFee = (amount && amount.total) || 0;
  const durationDays = getDurationDays(totalFee);

  const now = new Date();
  // 查现有会员（若未过期则续费叠加）
  const existing = await db.collection('memberships').where({ openid }).get();
  let baseDate = now;
  if (existing.data.length > 0 && existing.data[0].expireDate) {
    const exp = new Date(existing.data[0].expireDate);
    if (exp > now) baseDate = exp;
  }
  const newExpire = new Date(baseDate.getTime() + durationDays * 86400 * 1000);

  const memberData = {
    openid,
    isPro: true,
    remainingQuota: -1,   // Pro 用户无限制
    expireDate: newExpire,
    lastOrderNo: out_trade_no,
    lastPayAmount: totalFee,
    updatedAt: db.serverDate(),
  };

  if (existing.data.length > 0) {
    await db.collection('memberships').where({ openid }).update({ data: memberData });
  } else {
    await db.collection('memberships').add({ data: { ...memberData, createdAt: db.serverDate() } });
  }

  // 支付流水记录
  await db.collection('payment_records').add({
    data: {
      openid,
      outTradeNo: out_trade_no,
      amount: totalFee,
      currency: 'CNY',
      planDays: durationDays,
      expireAfter: newExpire,
      createdAt: db.serverDate(),
    }
  });

  console.log(`[notifyPayment] ✅ openid=${openid} 会员激活至 ${newExpire.toISOString()}, 订单=${out_trade_no}`);
}

// ─── 主入口（HTTP 触发器 POST 调用） ─────────────────────────────────────────
exports.main = async (event) => {
  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch (e) {
    console.error('[notifyPayment] body 解析失败:', e.message);
    return { code: 'FAIL', message: '请求体格式错误' };
  }

  if (!body || !body.resource || !body.resource.ciphertext) {
    console.error('[notifyPayment] 缺少 resource.ciphertext');
    return { code: 'FAIL', message: '缺少支付通知资源字段' };
  }

  // 只处理支付成功事件
  if (body.event_type !== 'TRANSACTION.SUCCESS') {
    console.log(`[notifyPayment] 忽略事件 ${body.event_type}`);
    return { code: 'SUCCESS', message: '非支付成功事件，已忽略' };
  }

  let transaction;
  try {
    transaction = decryptNotification(
      body.resource.ciphertext,
      body.resource.nonce,
      body.resource.associated_data
    );
  } catch (e) {
    console.error('[notifyPayment] 解密失败:', e.message);
    return { code: 'FAIL', message: '通知解密失败，请检查 WX_PAY_V3_KEY' };
  }

  if (transaction.trade_state !== 'SUCCESS') {
    console.log(`[notifyPayment] 交易非 SUCCESS: ${transaction.trade_state}`);
    return { code: 'SUCCESS', message: '交易未成功' };
  }

  const openid = transaction.payer && transaction.payer.openid;
  if (!openid) {
    console.error('[notifyPayment] 无法从 transaction 获取 openid');
    return { code: 'FAIL', message: '无 openid' };
  }

  try {
    await activateMembership(openid, transaction);
    return { code: 'SUCCESS', message: '支付成功，会员已激活' };
  } catch (err) {
    console.error('[notifyPayment] 激活会员失败:', err.message);
    return { code: 'FAIL', message: `内部错误: ${err.message}` };
  }
};
