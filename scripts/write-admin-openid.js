#!/usr/bin/env node
/**
 * write-admin-openid.js
 * 通过微信 HTTP API 将管理员 OpenID 写入云数据库 admins 集合
 *
 * 使用方式：
 *   node scripts/write-admin-openid.js
 *   ADMIN_OPENID=oXXXXXX node scripts/write-admin-openid.js
 *
 * 前提：~/.credentials/wechat-miniapp.env 已配置 MINIAPP_APPSECRET
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ─── 凭据读取 ────────────────────────────────────────────────────────────────
function loadCredentials() {
  const credFile = path.join(process.env.HOME, '.credentials', 'wechat-miniapp.env');
  if (fs.existsSync(credFile)) {
    fs.readFileSync(credFile, 'utf8').split('\n').forEach(line => {
      const m = line.match(/^([^=]+)=(.+)/);
      if (m) process.env[m[1]] = m[2].trim();
    });
  }
}

loadCredentials();

const APPID        = process.env.MINIAPP_APPID    || 'wx98c067e00cce09da';
const SECRET       = process.env.MINIAPP_APPSECRET;
const ENV_ID       = process.env.CLOUD_ENV_ID     || 'zenithjoycloud-8g4ca5pbb5b027e8';
const ADMIN_OPENID = process.env.ADMIN_OPENID     || 'o2lLz62X0iyQEYcpnS2ljUvXlHF0';

if (!SECRET) {
  console.error('❌ 缺少 MINIAPP_APPSECRET，请先执行：');
  console.error('   node scripts/sync-credentials.js');
  process.exit(1);
}

// ─── HTTP 工具 ───────────────────────────────────────────────────────────────
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ raw: data }); }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// ─── 主流程 ──────────────────────────────────────────────────────────────────
async function main() {
  console.log(`📋 云环境: ${ENV_ID}`);
  console.log(`👤 管理员 OpenID: ${ADMIN_OPENID}`);

  // Step 1: 获取 access_token
  console.log('\n[1/3] 获取 access_token...');
  const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${SECRET}`;
  const tokenResp = await httpsGet(tokenUrl);

  if (!tokenResp.access_token) {
    console.error('❌ 获取 access_token 失败:', JSON.stringify(tokenResp));
    process.exit(1);
  }
  const accessToken = tokenResp.access_token;
  console.log(`   ✅ access_token 获取成功（expires_in: ${tokenResp.expires_in}s）`);

  // Step 2: 检查 admins 集合中是否已存在该 OpenID
  console.log('\n[2/3] 检查 admins 集合...');
  const queryResp = await httpsPost(
    `https://api.weixin.qq.com/tcb/databasequery?access_token=${accessToken}`,
    {
      env: ENV_ID,
      query: `db.collection('admins').where({openId: '${ADMIN_OPENID}'}).limit(1).get()`,
    }
  );

  if (queryResp.errcode === 0 && queryResp.data) {
    let records = [];
    try { records = JSON.parse(queryResp.data); } catch {}
    if (records.length > 0) {
      console.log(`   ✅ 管理员 OpenID 已存在（${records.length} 条记录），无需重复写入`);
      console.log('\n✅ 完成！管理员已在 admins 集合中');
      return;
    }
    console.log('   📝 admins 集合中尚无此 OpenID，即将写入');
  } else if (queryResp.errcode === -501005 || queryResp.errcode === -501000) {
    console.error('\n⚠️  WeChat Cloud 权限限制，无法从外部查询数据库');
    console.error('   尝试直接写入（可能也受限）...');
  } else if (queryResp.errcode !== undefined && queryResp.errcode !== 0) {
    console.warn(`   ⚠️  查询返回错误 ${queryResp.errcode}，继续尝试写入...`);
  } else {
    console.log('   📝 admins 集合中尚无此 OpenID，即将写入');
  }

  // Step 3: 写入管理员记录
  console.log('\n[3/3] 写入管理员记录...');
  const now = new Date().toISOString();
  const addResp = await httpsPost(
    `https://api.weixin.qq.com/tcb/databaseadd?access_token=${accessToken}`,
    {
      env: ENV_ID,
      query: `db.collection('admins').add({data: {openId: '${ADMIN_OPENID}', role: 'superadmin', source: 'api-setup', createdAt: '${now}', remark: '通过 write-admin-openid.js 写入'}})`,
    }
  );

  if (addResp.errcode === 0) {
    console.log(`   ✅ 写入成功！id_list: ${JSON.stringify(addResp.id_list)}`);
    console.log('\n🎉 完成！');
    console.log(`   OpenID : ${ADMIN_OPENID}`);
    console.log(`   集合   : admins`);
    console.log(`   环境   : ${ENV_ID}`);
  } else if (addResp.errcode === -501005 || addResp.errcode === -501000) {
    // WeChat Cloud 环境不允许外部直接写入数据库
    console.error('\n⚠️  WeChat Cloud 环境权限限制：外部服务器无法直接写入云数据库');
    console.error('   （微信云开发环境只允许云函数内部或微信开发者工具访问 DB）\n');
    console.error('─── 替代方案 A：在开发者工具中调用 bootstrapAdmin 云函数 ────────');
    console.error('   1. 微信开发者工具 → 云开发控制台 → 云函数 → bootstrapAdmin');
    console.error('   2. 点击"调试"→"本地调用"，传入空参数 {}');
    console.error('   3. 返回 success: true 即写入成功');
    console.error('   注意：bootstrapAdmin 仅在 admins 集合为空时生效');
    console.error('');
    console.error('─── 替代方案 B：设置 checkAdmin 云函数环境变量（立即生效）────');
    console.error('   1. 微信开发者工具 → 云开发控制台 → 云函数 → checkAdmin → 配置');
    console.error(`   2. 添加环境变量：ADMIN_OPENIDS=${ADMIN_OPENID}`);
    console.error('   3. 保存后无需重新部署，checkAdmin 自动识别该 OpenID 为管理员');
    console.error('   提示：多个 OpenID 以英文逗号分隔');
    console.error('');
    console.error('─── 如何获取自己的 OpenID ─────────────────────────────────────');
    console.error('   打开小程序 → 我的 → 触发 checkAdmin → 在云函数日志中查看 OPENID');
    process.exit(1);
  } else {
    console.error('❌ 写入失败:', JSON.stringify(addResp));
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ 执行失败:', err.message);
  process.exit(1);
});
