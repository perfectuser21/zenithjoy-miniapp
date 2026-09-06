/**
 * app.json 结构守卫。
 *
 * 这一版小程序只有三个格子：素材 / 上传 / 我的。原来这个文件守的是旧 AI 助理
 * 形态的 frontstage 清单（那一版完整保留在 tag ai-assistant-v1），页面删掉之后
 * 它守的东西已经不存在了。
 *
 * 现在守的三件事，都是真出过事的：
 *   ① tabBar 里的页面必须在 pages 里 —— 少一个微信启动直接报错
 *   ② pages 里的每个页面在磁盘上必须四件套齐全 —— 漏一个 .wxml 就是白屏
 *   ③ 不能再引用云开发 —— wx.cloud 打一个够不着的环境就是「初始化失败」弹窗
 *      的来源，这一版已经整个拿掉，不能被无意中加回来
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const appConfig = require('../miniprogram/app.json')

const EXPECTED_TABS = [
  { pagePath: 'pages/materials/materials', text: '素材' },
  { pagePath: 'pages/upload/upload', text: '上传' },
  { pagePath: 'pages/user/user', text: '我的' }
]

test('tabBar 就是素材 / 上传 / 我的三个格子', () => {
  const list = appConfig.tabBar.list.map((t) => ({ pagePath: t.pagePath, text: t.text }))
  expect(list).toEqual(EXPECTED_TABS)
})

test('tabBar 里的每个页面都在 pages 里 —— 少一个微信启动直接报错', () => {
  appConfig.tabBar.list.forEach((tab) => {
    expect(appConfig.pages).toContain(tab.pagePath)
  })
})

test('第一个 page 是素材库 —— 它是启动页', () => {
  expect(appConfig.pages[0]).toBe('pages/materials/materials')
})

test('pages 里的每个页面四件套齐全 —— 漏一个 .wxml 就是白屏', () => {
  const missing = []
  appConfig.pages.forEach((p) => {
    ;['js', 'json', 'wxml', 'wxss'].forEach((ext) => {
      const f = path.join(ROOT, 'miniprogram', `${p}.${ext}`)
      if (!fs.existsSync(f)) missing.push(`${p}.${ext}`)
    })
  })
  expect(missing).toEqual([])
})

test('不再引用微信云开发 —— wx.cloud 打不着的环境就是「初始化失败」的来源', () => {
  const offenders = []
  const walk = (dir) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) return walk(full)
      if (!e.name.endsWith('.js')) return
      const src = fs.readFileSync(full, 'utf8')
      // 注释里提这段历史是可以的，实际调用不行
      const code = src.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
      if (/wx\.cloud\s*\./.test(code)) offenders.push(path.relative(ROOT, full))
    })
  }
  walk(path.join(ROOT, 'miniprogram'))
  expect(offenders).toEqual([])
})
