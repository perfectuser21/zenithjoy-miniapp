const DEFAULT_HTML = `<div style="padding:12px;">
  <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:16px;border-radius:12px;">
    <div style="font-size:12px;opacity:.9;">实时映射</div>
    <div style="font-size:18px;font-weight:700;margin-top:6px;">这是右侧的小程序样子</div>
    <div style="font-size:13px;opacity:.95;margin-top:6px;">你在左边改 HTML，右边立即同步</div>
  </div>

  <div style="display:flex;gap:8px;margin-top:12px;">
    <div style="flex:1;background:#fff;padding:10px;border-radius:10px;">
      <div style="font-size:14px;font-weight:600;">智能选题</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">先定方向</div>
    </div>
    <div style="flex:1;background:#fff;padding:10px;border-radius:10px;">
      <div style="font-size:14px;font-weight:600;">脚本生成</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">快速输出</div>
    </div>
  </div>

  <div style="background:#fff;padding:12px;border-radius:10px;margin-top:12px;">
    <div style="font-size:14px;font-weight:600;">内容流示例</div>
    <div style="font-size:12px;color:#6b7280;margin-top:4px;">这里可以放文章、卡片、按钮等 HTML 结构</div>
  </div>
</div>`;

Page({
  data: {
    htmlCode: DEFAULT_HTML,
    previewHtml: DEFAULT_HTML
  },

  onHtmlInput(e) {
    const htmlCode = e.detail.value;
    this.setData({
      htmlCode,
      previewHtml: htmlCode
    });
  },

  resetCode() {
    this.setData({
      htmlCode: DEFAULT_HTML,
      previewHtml: DEFAULT_HTML
    });
  },

  copyCode() {
    wx.setClipboardData({
      data: this.data.htmlCode,
      success: () => {
        wx.showToast({ title: 'HTML 已复制', icon: 'success' });
      }
    });
  }
});
