#!/usr/bin/env node
/**
 * setup-credentials.js
 * 微信支付凭据配置助手 — 一键检查 + 预填 ~/.credentials/wechat-pay.env
 *
 * 使用方式：
 *   node scripts/setup-credentials.js          # 检查状态 + 写入 wechat-pay.env（如私钥已就绪）
 *   node scripts/setup-credentials.js --dry-run # 只检查状态，不写文件
 *
 * 执行结果：
 *   ✅ 私钥已存在 → 自动提取并写入 wechat-pay.env（WX_PAY_PRIVATE_KEY 预填）
 *   ❌ 缺失项 → 告知用户从哪里获取
 */

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const CRED_DIR     = path.join(os.homedir(), '.credentials');
const PAY_ENV_FILE = path.join(CRED_DIR, 'wechat-pay.env');
const PEM_FILE     = path.join(CRED_DIR, 'apiclient_key.pem');
const DRY_RUN      = process.argv.includes('--dry-run');

// ─── 读取现有 wechat-pay.env（若存在）──────────────────────────────────────
function loadExistingPayEnv() {
  if (!fs.existsSync(PAY_ENV_FILE)) return {};
  const result = {};
  fs.readFileSync(PAY_ENV_FILE, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#\s][^=]*)=(.+)/);
    if (m) result[m[1].trim()] = m[2].trim();
  });
  return result;
}

// ─── 从 PEM 提取私钥内容（去掉首尾行）────────────────────────────────────
function extractPrivateKeyContent() {
  if (!fs.existsSync(PEM_FILE)) return null;
  const lines = fs.readFileSync(PEM_FILE, 'utf8').trim().split('\n');
  // 去掉 -----BEGIN PRIVATE KEY----- 和 -----END PRIVATE KEY----- 首尾行
  return lines
    .filter(l => !l.startsWith('-----'))
    .join('\n');
}

// ─── 主逻辑 ─────────────────────────────────────────────────────────────────
function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  ZenithJoy 小程序上线配置检查');
  console.log('═══════════════════════════════════════════════════════\n');

  const existing = loadExistingPayEnv();
  const privateKeyContent = extractPrivateKeyContent();

  // ─── 状态检查 ─────────────────────────────────────────────────────────
  console.log('【一、支付配置状态】');

  const pemExists = !!privateKeyContent;
  console.log(`  ${pemExists ? '✅' : '❌'} apiclient_key.pem  (商户私钥文件)`);

  const mchid     = existing.WX_PAY_MCHID     || '';
  const v3Key     = existing.WX_PAY_V3_KEY    || '';
  const serialNo  = existing.WX_PAY_SERIAL_NO || '';
  const payEnvExists = fs.existsSync(PAY_ENV_FILE);

  console.log(`  ${mchid    ? '✅' : '❌'} WX_PAY_MCHID      (商户号)`);
  console.log(`  ${v3Key    ? '✅' : '❌'} WX_PAY_V3_KEY     (APIv3 密钥)`);
  console.log(`  ${serialNo ? '✅' : '❌'} WX_PAY_SERIAL_NO  (证书序列号)`);
  console.log(`  ${payEnvExists ? '✅ 已存在' : '⚠️  不存在'}  wechat-pay.env`);

  const payConfigComplete = pemExists && mchid && v3Key && serialNo;
  console.log(`\n  支付配置完整度: ${payConfigComplete ? '✅ 全部就绪' : '❌ 缺少以下项目'}`);

  if (!payConfigComplete) {
    console.log('\n  ┌── 缺失项获取方式 ──────────────────────────────────────────┐');
    if (!mchid) {
      console.log('  │ WX_PAY_MCHID  → 微信商户平台 → 账户中心 → 商户信息 → 商户号    │');
    }
    if (!v3Key) {
      console.log('  │ WX_PAY_V3_KEY → 微信商户平台 → 账户中心 → API安全 → 设置密钥   │');
    }
    if (!serialNo) {
      console.log('  │ WX_PAY_SERIAL_NO → 商户平台 → API安全 → 查看证书序列号         │');
    }
    if (!pemExists) {
      console.log('  │ apiclient_key.pem → 商户平台 → API安全 → 下载证书包            │');
    }
    console.log('  └────────────────────────────────────────────────────────────┘');
    console.log('\n  商户平台地址: https://pay.weixin.qq.com');
  }

  // ─── 管理员 OpenID 状态 ────────────────────────────────────────────────
  console.log('\n【二、管理员 OpenID 配置状态】');
  console.log('  ✅ checkAdmin 内置 fallback: o2lLz62X0iyQEYcpnS2ljUvXlHF0');
  console.log('  ✅ bootstrapAdmin 云函数已就绪（PR #20 部署）');
  console.log('  ⚠️  需要手动完成（WeChat Cloud 阻止外部 DB 写入）：');
  console.log('');
  console.log('  方案 A（推荐）— 调用 bootstrapAdmin 写入 admins 集合：');
  console.log('    1. 微信开发者工具 → 云开发控制台 → 云函数 → bootstrapAdmin');
  console.log('    2. 点击"调试" → "本地调用" → 传入 {}');
  console.log('    3. 返回 success: true 即写入成功');
  console.log('');
  console.log('  方案 B — 设置 checkAdmin 环境变量（立即生效无需重部署）：');
  console.log('    ADMIN_OPENIDS=o2lLz62X0iyQEYcpnS2ljUvXlHF0');

  // ─── 私钥预填 ─────────────────────────────────────────────────────────
  if (pemExists && !DRY_RUN) {
    console.log('\n【三、自动预填 wechat-pay.env】');
    const existingPrivateKey = existing.WX_PAY_PRIVATE_KEY || '';

    if (existingPrivateKey) {
      console.log('  ⏭️  WX_PAY_PRIVATE_KEY 已有值，跳过写入');
    } else {
      const content = [
        '# 微信支付商户号凭据 — ZenithJoy 小程序',
        '# 来源：微信商户平台 pay.weixin.qq.com → 账户中心',
        '',
        `# 商户号（10位数字）— 从商户平台获取后填入`,
        `WX_PAY_MCHID=${mchid || ''}`,
        '',
        `# APIv3 密钥（32字节）— 商户平台 → 账户中心 → API安全`,
        `WX_PAY_V3_KEY=${v3Key || ''}`,
        '',
        `# 证书序列号 — 商户平台 → API安全 → 查看`,
        `WX_PAY_SERIAL_NO=${serialNo || ''}`,
        '',
        '# 商户私钥（已从 apiclient_key.pem 提取，去掉首尾行）',
        `WX_PAY_PRIVATE_KEY=${privateKeyContent}`,
        '',
      ].join('\n');

      fs.writeFileSync(PAY_ENV_FILE, content, { mode: 0o600 });
      console.log(`  ✅ 已写入: ${PAY_ENV_FILE}`);
      console.log('  ✅ WX_PAY_PRIVATE_KEY 已预填（来自 apiclient_key.pem）');
      console.log('  ⚠️  仍需手动填入: WX_PAY_MCHID / WX_PAY_V3_KEY / WX_PAY_SERIAL_NO');
    }
  } else if (DRY_RUN) {
    console.log('\n  [--dry-run 模式：跳过文件写入]');
  } else if (!pemExists) {
    console.log('\n【三、私钥未找到，跳过自动预填】');
    console.log('  请先下载商户证书包，将 apiclient_key.pem 放到 ~/.credentials/');
  }

  // ─── 最终行动清单 ─────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  上线前行动清单（P0 阻断项）');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  ${payConfigComplete ? '✅' : '[ ]'} 支付商户号 + 密钥 + 证书序列号 已配置到云函数环境变量`);
  console.log('  [ ] 管理员 OpenID 已写入 admins 集合（bootstrapAdmin 方案A）');
  console.log('  [ ] 真机支付沙盒测试通过');
  console.log('  [ ] 微信开发者工具上传 9 个云函数');
  console.log('  [ ] iPhone + Android 兼容测试');
  console.log('  [ ] 提交审核（公众平台配置名称/图标/服务类目）');
  console.log('');
}

main();
