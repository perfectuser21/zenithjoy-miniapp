const fs = require('fs');
const path = require('path');
const ci = require('miniprogram-ci');
const { getBaseConfig, getVersion, resolveSecret } = require('./ci-config');

async function main() {
  const config = getBaseConfig();
  const qrcodeOutputDest =
    process.env.MINIAPP_PREVIEW_QRCODE || 'dist/preview-qrcode.png';
  const desc =
    process.env.MINIAPP_PREVIEW_DESC || 'Codex automated preview build';
  // 启动页 = 素材库。pages/index/index 是旧 AI 助理形态的首页，已随那一版
  // 一起摘掉（保留在 tag ai-assistant-v1），这里写它会扫出来直接白屏。
  const pagePath = process.env.MINIAPP_PREVIEW_PAGE || 'pages/materials/materials';
  const searchQuery = process.env.MINIAPP_PREVIEW_QUERY || '';
  const robot = Number(process.env.MINIAPP_ROBOT || 1);
  const qrcodeDir = path.dirname(qrcodeOutputDest);

  fs.mkdirSync(qrcodeDir, { recursive: true });

  const project = new ci.Project(config);

  const result = await ci.preview({
    project,
    version: getVersion(),
    desc,
    setting: {
      es6: true,
      minifyJS: true,
      minifyWXML: true,
      minifyWXSS: true
    },
    qrcodeFormat: 'image',
    qrcodeOutputDest,
    robot,
    pagePath,
    searchQuery,
    onProgressUpdate(message) {
      console.log(message);
    }
  });

  const previewLink = resolveSecret(
    process.env.MINIAPP_NOTIFY_LINK || process.env.MINIAPP_NOTIFY_LINK_REF,
    'MINIAPP_NOTIFY_LINK'
  );

  console.log('Preview created successfully.');
  console.log(`QR code saved to: ${qrcodeOutputDest}`);
  if (previewLink) {
    console.log(`Notify target configured: ${previewLink}`);
  }
  console.log(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
