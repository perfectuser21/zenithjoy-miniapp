# Neon Tech Theme (draft)

This theme gives the four核心页面（Home / Workflow / AI Chat / User）一套更偏科技、AI 质感的霓虹色系：深空底色 + 青绿 / 品红 / 电紫高光，玻璃质感卡片。

当前代码不会自动切换到该主题；你可以按需在 WXML 中引入 `themes/neon.wxss` 并用文档里的类名替换现有样式，或逐步迁移。

## 调色盘
- Base 深色: `#050914` / `#070c18`
- 面板玻璃: `rgba(16, 26, 46, 0.88)` 边框 `rgba(99, 182, 255, 0.24)` 阴影 `rgba(5, 12, 36, 0.32)`
- 亮青: `#3cf2ff`
- 电紫: `#7a5bff`
- 霓虹品红: `#ff6fd8`
- 石墨灰文本: `#c6d4f5`，次级 `#93a6cc`
- 渐变: `linear-gradient(135deg, #3cf2ff 0%, #7a5bff 52%, #ff6fd8 100%)`

## 可复用类（见 neon.wxss）
- 背景与面板: `.bg-sky`, `.panel`, `.panel-ghost`, `.glass`, `.divider`
- 文本: `.text-hero`, `.text-sub`, `.text-dim`, `.text-accent`
- 按钮: `.btn-primary`, `.btn-ghost`, `.pill`
- 徽章/芯片: `.chip`, `.chip-accent`, `.chip-soft`
- 气泡: `.bubble-user`, `.bubble-ai`
- 卡片网格: `.grid-2`, `.grid-3`
- 状态色: `.success`, `.warning`, `.danger`

## 使用示例
在页面 WXML 头部引入：
```xml
<import src="/themes/neon.wxss" />
```
或在 `app.wxss` 追加：
```css
@import "/themes/neon.wxss";
```

替换示例（首页 CTA）：
```wxml
<view class="btn-primary pill">开始创作</view>
<view class="btn-ghost pill">查看洞察</view>
```

聊天气泡：
```wxml
<view class="message-item user-message">
  <view class="bubble-user">...</view>
</view>
<view class="message-item assistant-message">
  <view class="bubble-ai">...</view>
</view>
```

面板卡片：
```wxml
<view class="panel glass">
  <view class="text-hero">今日策略</view>
  <view class="text-dim">AI 已为你准备好 3 条行动</view>
  <view class="divider"></view>
  ...
</view>
```

## 迁移建议
1) 先在需要试色的页面顶部引入 neon.wxss。
2) 将大容器背景改为 `.bg-sky`；卡片外层改为 `.panel glass`；CTA/按钮改为 `.btn-primary` 或 `.btn-ghost`。
3) 文本层级：标题用 `.text-hero`，副标题 `.text-sub`，说明 `.text-dim`，高亮数字用 `.text-accent`。
4) 逐步替换局部颜色，确认无布局变化后再删除旧色值。

