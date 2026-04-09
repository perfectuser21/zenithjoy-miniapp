const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SUPPORTED_NODE_MAJORS = new Set([18, 20, 22]);
const CANDIDATE_NODE_BINARIES = [
  '/opt/homebrew/opt/node@22/bin/node',
  '/opt/homebrew/opt/node@20/bin/node',
  '/opt/homebrew/opt/node@18/bin/node',
  '/usr/local/opt/node@22/bin/node',
  '/usr/local/opt/node@20/bin/node',
  '/usr/local/opt/node@18/bin/node'
];
const requestedScript = process.argv[2];
const scriptArgs = process.argv.slice(3);

if (!requestedScript) {
  console.error('Missing target script path.');
  process.exit(1);
}

const resolvedScript = path.resolve(process.cwd(), requestedScript);

if (!fs.existsSync(resolvedScript)) {
  console.error(`Script not found: ${resolvedScript}`);
  process.exit(1);
}

function getNodeMajor(versionString) {
  const match = /^v(\d+)\./.exec(versionString);
  return match ? Number(match[1]) : NaN;
}

function getBinaryNodeMajor(nodeBinary) {
  const result = spawnSync(nodeBinary, ['-v'], {
    encoding: 'utf8'
  });

  if (result.error || result.status !== 0) {
    return NaN;
  }

  return getNodeMajor((result.stdout || '').trim());
}

function runWithNode(nodeBinary) {
  const result = spawnSync(nodeBinary, [resolvedScript, ...scriptArgs], {
    stdio: 'inherit',
    env: process.env
  });

  if (result.error) {
    throw result.error;
  }

  process.exit(result.status ?? 1);
}

const currentMajor = getNodeMajor(process.version);

if (SUPPORTED_NODE_MAJORS.has(currentMajor)) {
  runWithNode(process.execPath);
}

const configuredNodeBin = process.env.MINIAPP_NODE_BIN;

if (configuredNodeBin) {
  runWithNode(configuredNodeBin);
}

for (const candidateBinary of CANDIDATE_NODE_BINARIES) {
  if (!fs.existsSync(candidateBinary)) {
    continue;
  }

  if (SUPPORTED_NODE_MAJORS.has(getBinaryNodeMajor(candidateBinary))) {
    runWithNode(candidateBinary);
  }
}

console.error(
  [
    `Unsupported Node.js version ${process.version}.`,
    'miniprogram-ci in this project supports Node 18, 20, or 22.',
    'Set MINIAPP_NODE_BIN to an installed LTS Node binary and rerun.',
    'Auto-detection checks common Homebrew Node 18/20/22 paths before failing.',
    'Example: MINIAPP_NODE_BIN=/opt/homebrew/opt/node@20/bin/node npm run preview'
  ].join('\n')
);
process.exit(1);
