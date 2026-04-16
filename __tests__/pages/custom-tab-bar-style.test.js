const fs = require('fs')
const path = require('path')

describe('custom tab bar style', () => {
  test('tab bar typography and geometry match pencil nav', () => {
    const wxssPath = path.resolve(__dirname, '../../miniprogram/custom-tab-bar/index.wxss')
    const wxss = fs.readFileSync(wxssPath, 'utf8')

    expect(wxss).toContain('.tabbar-pill {')
    expect(wxss).toContain('min-height: 104rpx;')
    expect(wxss).toContain('padding: 6rpx 20rpx 6rpx;')
    expect(wxss).toContain('gap: 4rpx;')

    expect(wxss).toContain('.tab-item {')
    expect(wxss).toContain('height: 88rpx;')

    expect(wxss).toContain('.tab-text {')
    expect(wxss).toContain('font-size: 27rpx;')
    expect(wxss).toContain('font-weight: 600;')
    expect(wxss).toContain('.tab-item-active .tab-text {')
    expect(wxss).toContain('font-weight: 700;')
  })

  test('tab bar is docked to the bottom instead of floating above page content', () => {
    const wxssPath = path.resolve(__dirname, '../../miniprogram/custom-tab-bar/index.wxss')
    const wxss = fs.readFileSync(wxssPath, 'utf8')

    expect(wxss).toContain('.tabbar-shell {')
    expect(wxss).toContain('padding: 0 0 calc(env(safe-area-inset-bottom) + 0rpx);')
    expect(wxss).toContain('background: #FFFFFF;')
    expect(wxss).toContain('border-top: 1rpx solid #E5E7EB;')

    expect(wxss).toContain('.tabbar-pill {')
    expect(wxss).toContain('padding: 6rpx 20rpx 6rpx;')
    expect(wxss).toContain('background: #FFFFFF;')
    expect(wxss).not.toContain('box-shadow: 0 -6rpx 18rpx rgba(42, 51, 103, 0.06), 0 16rpx 40rpx rgba(42, 51, 103, 0.14);')
  })
})
