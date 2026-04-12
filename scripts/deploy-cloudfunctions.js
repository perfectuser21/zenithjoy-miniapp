#!/usr/bin/env node
/**
 * deploy-cloudfunctions.js
 * 使用 miniprogram-ci 将所有云函数部署到生产环境
 *
 * 前提：
 *   ~/.credentials/wechat-miniapp.env 已配置 MINIAPP_APPID / MINIAPP_APPSECRET
 *   ~/.credentials/private.wx98c067e00cce09da.key 存在（CI 私钥）
 *
 * 用法：
 *   node scripts/deploy-cloudfunctions.js [函数名]
 *   node scripts/deploy-cloudfunctions.js          # 部署全部
 *   node scripts/deploy-cloudfunctions.js checkAdmin  # 仅部署指定函数
 */

const ci = require('miniprogram-ci');
const path = require('path');
const fs = require('fs');
const { getBaseConfig } = require('./ci-config');

const CLOUD_ENV = process.env.CLOUD_ENV_ID || 'zenithjoycloud-8g4ca5pbb5b027e8';
const FUNCTIONS_ROOT = path.join(process.cwd(), 'cloudfunctions');

async function deployFunction(project, funcName) {
  const funcDir = path.join(FUNCTIONS_ROOT, funcName);
  if (!fs.existsSync(funcDir)) {
    console.warn(`  ⚠️  跳过 ${funcName}（目录不存在）`);
    return;
  }
  try {
    await ci.cloud.uploadFunction({
      project,
      name: funcName,
      path: funcDir,
      env: CLOUD_ENV,
      onProgressUpdate(msg) {
        if (typeof msg === 'string') process.stdout.write(`    ${msg}\r`);
      }
    });
    console.log(`  ✅ ${funcName}`);
  } catch (err) {
    console.error(`  ❌ ${funcName}: ${err.message}`);
    throw err;
  }
}

async function main() {
  const config = getBaseConfig();
  const project = new ci.Project(config);

  const targetFunc = process.argv[2];

  if (targetFunc) {
    console.log(`\n🚀 部署云函数: ${targetFunc}`);
    await deployFunction(project, targetFunc);
    console.log('\n✅ 完成');
    return;
  }

  // 部署全部
  const funcs = fs.readdirSync(FUNCTIONS_ROOT).filter(f => {
    return fs.statSync(path.join(FUNCTIONS_ROOT, f)).isDirectory();
  });

  console.log(`\n🚀 部署全部云函数（共 ${funcs.length} 个）到 ${CLOUD_ENV}`);
  let ok = 0;
  let failed = [];

  for (const fn of funcs) {
    process.stdout.write(`  部署 ${fn}... `);
    try {
      await deployFunction(project, fn);
      ok++;
    } catch (err) {
      failed.push(fn);
    }
  }

  console.log(`\n📊 结果: ${ok} 成功, ${failed.length} 失败`);
  if (failed.length > 0) {
    console.error('  失败列表:', failed.join(', '));
    process.exit(1);
  }
  console.log('✅ 全部云函数部署完成');
}

main().catch(err => {
  console.error('❌ 部署失败:', err.message);
  process.exit(1);
});
