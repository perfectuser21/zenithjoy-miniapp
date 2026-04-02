const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

function readProjectConfig() {
  const projectConfigPath = path.join(process.cwd(), 'project.config.json');
  return JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resolveSecret(value, label) {
  if (!value) {
    return '';
  }

  if (!value.startsWith('op://')) {
    return value;
  }

  try {
    return execFileSync('op', ['read', value], {
      encoding: 'utf8'
    }).trim();
  } catch (error) {
    throw new Error(`Failed to read ${label} from 1Password: ${error.message}`);
  }
}

function ensurePrivateKey() {
  const privateKey = resolveSecret(
    process.env.MINIAPP_PRIVATE_KEY || process.env.MINIAPP_PRIVATE_KEY_REF,
    'MINIAPP_PRIVATE_KEY'
  );

  if (!privateKey) {
    throw new Error(
      'Missing MINIAPP_PRIVATE_KEY or MINIAPP_PRIVATE_KEY_REF. Set it to the PEM content or an op:// secret reference.'
    );
  }

  const dir = path.join(os.tmpdir(), 'zenithjoy-miniapp-ci');
  ensureDir(dir);

  const privateKeyPath = path.join(dir, 'private.key');
  fs.writeFileSync(privateKeyPath, privateKey);

  return privateKeyPath;
}

function getVersion() {
  return (
    process.env.MINIAPP_VERSION ||
    process.env.npm_package_version ||
    `0.1.${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
  );
}

function getBaseConfig() {
  const projectConfig = readProjectConfig();

  return {
    appid: process.env.MINIAPP_APPID || projectConfig.appid,
    projectPath: process.cwd(),
    privateKeyPath: ensurePrivateKey(),
    ignores: ['node_modules/**/*']
  };
}

module.exports = {
  getBaseConfig,
  getVersion,
  readProjectConfig,
  resolveSecret
};
