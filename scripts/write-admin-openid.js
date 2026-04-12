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
  }
  console.log('   📝 admins 集合中尚无此 OpenID，即将写入');

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
  } else {
    console.error('❌ 写入失败:', JSON.stringify(addResp));
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ 执行失败:', err.message);
  process.exit(1);
});
