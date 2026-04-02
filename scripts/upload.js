const ci = require('miniprogram-ci');
const { getBaseConfig, getVersion } = require('./ci-config');

async function main() {
  const config = getBaseConfig();
  const desc =
    process.env.MINIAPP_UPLOAD_DESC || 'Codex automated upload build';
  const robot = Number(process.env.MINIAPP_ROBOT || 1);

  const project = new ci.Project(config);

  const result = await ci.upload({
    project,
    version: getVersion(),
    desc,
    robot,
    setting: {
      es6: true,
      minifyJS: true,
      minifyWXML: true,
      minifyWXSS: true
    },
    onProgressUpdate(message) {
      console.log(message);
    }
  });

  console.log('Upload completed successfully.');
  console.log(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
