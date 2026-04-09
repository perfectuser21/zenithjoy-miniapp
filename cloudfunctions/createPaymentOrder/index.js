// createPaymentOrder 云函数
// 生产环境需对接微信支付商户API（统一下单接口）
// 当前为 mock 版本，返回占位参数供前端流程调试
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const { planId } = event;
  const wxContext = cloud.getWXContext();

  if (!planId) {
    return { success: false, error: '缺少套餐参数 planId' };
  }

  // TODO: 生产环境替换为真实统一下单逻辑
  // 1. 查询 membership_plans 获取金额
  // 2. 调用微信支付统一下单 API（mch_id + key 签名）
  // 3. 返回 prepay_id 和签名参数

  // Mock 返回（仅供开发调试，真实支付会失败）
  const mockTimestamp = String(Math.floor(Date.now() / 1000));
  return {
    success: true,
    timeStamp: mockTimestamp,
    nonceStr: Math.random().toString(36).substring(2, 18),
    package: 'prepay_id=mock_prepay_id_' + planId,
    signType: 'MD5',
    paySign: 'MOCK_PAY_SIGN',
    _mock: true,
    _openid: wxContext.OPENID,
    _planId: planId
  };
};
