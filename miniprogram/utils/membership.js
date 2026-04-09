/**
 * 检查当前用户 AI 使用配额
 * @returns {Promise<boolean>} true = 有配额可继续，false = 配额耗尽已阻断
 */
async function checkQuota() {
  try {
    const res = await wx.cloud.callFunction({ name: 'checkMembership' });
    const remaining = res.result?.data?.remainingQuota ?? 0;
    if (remaining !== -1 && remaining <= 0) {
      wx.showModal({
        title: '今日配额已用完',
        content: '升级会员可获得更多次数',
        confirmText: '去升级',
        cancelText: '取消',
        success: (r) => {
          if (r.confirm) {
            wx.navigateTo({ url: '/pages/membership/membership' });
          }
        }
      });
      return false;
    }
    return true;
  } catch {
    // 配额检查失败时放行，避免影响正常使用
    return true;
  }
}

module.exports = { checkQuota };
