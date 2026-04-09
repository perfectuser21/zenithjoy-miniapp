/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFiles: ['<rootDir>/__tests__/setup/wx-mock.js'],
  // 小程序源码为纯 CJS，跳过 Babel 转换避免版本冲突
  transform: {},
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/miniprogram/$1'
  }
}
