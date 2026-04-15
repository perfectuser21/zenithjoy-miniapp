const fs = require('fs');
const path = require('path');
const { RETIRED_FRONTSTAGE_PAGES } = require('../../miniprogram/utils/frontstage-routes');

function walkJsFiles(dir, result = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkJsFiles(fullPath, result);
      return;
    }
    if (fullPath.endsWith('.js')) {
      result.push(fullPath);
    }
  });
  return result;
}

test('frontstage routes do not point to retired public pages', () => {
  const root = path.resolve(__dirname, '../../miniprogram/pages');
  const frontstageDirs = [
    'index',
    'ai-features',
    'assistant',
    'user',
    'copywriter',
    'ranking',
    'reading-list'
  ].map((dir) => path.join(root, dir));

  const violations = [];
  frontstageDirs.forEach((dir) => {
    walkJsFiles(dir).forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');
      RETIRED_FRONTSTAGE_PAGES.forEach((route) => {
        if (content.includes(route)) {
          violations.push(`${path.relative(process.cwd(), file)} -> ${route}`);
        }
      });
    });
  });

  expect(violations).toEqual([]);
});
