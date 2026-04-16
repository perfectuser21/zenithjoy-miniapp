# Pencil -> 小程序发布 SOP

日期：2026-04-15

## 目的

把 `designs/pencil-ui.pen` 作为唯一真相源，建立一条从设计稿到小程序上传的强约束链路，避免出现：

- 改的是一套代码，上传的是另一套代码
- 页面职责看起来对，但视觉结构不是同一张设计稿
- 文案接近设计稿，但字号、间距、层级、装饰节点仍是旧稿
- 上传成功却误判为“已经和设计稿一致”

## 适用范围

当前仓库：`zenithjoy-miniapp`

设计稿文件：
- `designs/pencil-ui.pen`

重点一级页映射：
- `Home` -> `miniprogram/pages/index/index.*`
- `Workflow` -> `miniprogram/pages/ai-features/index.*`
- `AI Chat Home` -> `miniprogram/pages/assistant/index.*`
- `My Center` -> `miniprogram/pages/user/user.*`

重点二级页映射：
- `朋友圈文案 / 生成页` -> `miniprogram/pages/copywriter/moments-generate/moments-generate.*`
- `朋友圈文案 / 精修页` -> `miniprogram/pages/copywriter/moments-editor/moments-editor.*`

## 标准流程

### 1. 锁定真相源

每次开始同步前，必须重新确认当前活跃 Pencil 文件和当前 top-level frames。

必做动作：
- `get_editor_state`
- 记录当前活跃文件路径
- 记录本次要同步的页面码和页面名

禁止项：
- 复用上一轮的截图或记忆
- 认为“上次已经看过设计稿，所以这次不用再读”

### 2. 建立唯一页面映射

每个 Pencil frame 必须映射到唯一一个小程序路由和文件组。

映射表必须包含：
- 页面码
- 页面名
- 小程序 `pagePath`
- `WXML/WXSS/JS` 路径
- `switchTab` 或 `navigateTo`

验收点：
- 以 `miniprogram/app.json` 为准确认当前实际路由
- 不能只看目录名猜测入口页

### 3. 抓双重设计证据

每次同步都必须同时抓：
- `get_screenshot`
- `batch_get`

只看截图不够，因为截图无法给出精确字号、间距、圆角和 sibling hierarchy。
只看节点数据也不够，因为节点数据无法替代整体视觉层级判断。

### 4. 设计值换算

Pencil 基于 `390px` 画板，小程序基于 `750rpx` 布局宽度。

换算规则：
- `target_rpx ~= pencil_px * 750 / 390`
- 约等于 `1.92x`

常用换算：
- `10px -> 19rpx`
- `11px -> 21rpx`
- `12px -> 23rpx`
- `14px -> 27rpx`
- `16px -> 31rpx`
- `18px -> 35rpx`
- `20px -> 38rpx`
- `22px -> 42rpx`
- `24px -> 46rpx`
- `32px -> 62rpx`

硬规则：
- 不能把 Pencil `px` 直接抄成 `rpx`
- 不能保留旧稿的层级关系
- 也不能为了“看起来更大”把本来同级的 sibling 强行做成主次

### 5. 逐页改代码

按页面映射逐页同步：
- 先改 `WXML` 结构
- 再改 `WXSS` 视觉
- 最后改 `JS` 数据和行为

先后顺序不能反：
- 先保证页面职责和区块结构正确
- 再保证字号、间距、chip、按钮、图像、状态正确
- 最后接运行时数据

### 6. 本地验收 Gate

每页必须做四类检查：

1. 路由检查
- `app.json` 是否指向刚才改的页面

2. 结构检查
- 区块顺序是否和 Pencil 一致
- 卡片数量和分组是否一致
- 底部 tab 激活态是否一致

3. 节点检查
- 标题字号
- 说明字号
- chip 字号
- 按钮字号
- padding / gap / radius
- fill / stroke / 阴影

4. 截图检查
- 用开发者工具或真机截图，和 Pencil 原图并排比对

页面状态字段：
- `Structure: PASS | FAIL`
- `Typography: PASS | FAIL`
- `Content: PASS | FAIL`
- `Visual: PASS | FAIL`

只要有一项 `FAIL`，该页不得进入上传批次。

### 7. 干净上传

上传前必须记录：
- 上传时间
- 上传描述
- 上传时工作区状态
- 本次通过验收的页面范围

硬规则：
- 上传的必须是刚通过验收的那份代码
- 不能“先上传看看”
- 不能把未核对的脏工作区当成验收包

### 8. 上传后复核

上传成功只代表“包已上传”，不代表“与设计稿一致”。

上传后必须做：
- 开发版/真机逐页打开
- 与 Pencil 截图并排复核
- 记录剩余差异

只有上传后复核也通过，才能标记该批次完成。

## 本次重跑结果

本次重新执行的证据：
- 已重新执行 `get_editor_state`
- 已重新抓取 `Home / Workflow / 朋友圈生成 / 朋友圈精修` 四页截图
- 已重新抓取四页节点数据
- 已重新核对 `miniprogram/app.json`
- 已重新核对对应小程序页面文件

### 当前页面级结论

#### Home

Pencil 当前事实：
- 页面标题是 `今天先做什么`
- 顶部是用户入口胶囊，不是品牌标题 + 会员按钮
- 主体区块是 `hero -> 今日榜单 -> 自媒体创作区域(卡片网格) -> 自媒体前沿创作集 -> pill`
- 榜单三行标题同级：`14/14/14`
- 创作集三行标题同级：`14/14/14`

当前代码事实：
- `miniprogram/pages/index/index.wxml` 仍是品牌型首页结构
- `miniprogram/pages/index/index.wxss` 仍保留旧的主次层级

根因：
- 结构未按当前 Pencil 重建
- sibling typography 仍停留在旧稿

状态：
- `Structure: FAIL`
- `Typography: FAIL`
- `Content: FAIL`
- `Visual: FAIL`

#### Workflow

Pencil 当前事实：
- 顶部是 `CREATE STUDIO + 今天创作什么 + 可用积分 128`
- banner 之后是三块：`自媒体创作区域 / 标题创作 / 朋友圈文案`
- `自媒体创作区域` 内含四步流程条和 CTA
- 底部是 pill tab，且 `创作` 激活

当前代码事实：
- `miniprogram/pages/ai-features/index.wxml` 仍是三张通用动作卡
- 没有还原 `createTools / titleSection / momentsSection` 的当前结构

根因：
- 页面骨架仍不是当前 Pencil 那张稿

状态：
- `Structure: FAIL`
- `Typography: FAIL`
- `Content: FAIL`
- `Visual: FAIL`

#### 朋友圈文案 / 生成页

Pencil 当前事实：
- `hero -> 内容想法 -> 六大文案框架 -> 表达角度 -> 目标选择策略 -> footer`
- 关键字号：
  - hero title `20px`
  - card title `16px`
  - chip/button text `14px`

当前代码事实：
- 页面结构大体接近
- 但仍需逐项核对字体、chip、按钮和文案来源

状态：
- `Structure: PARTIAL`
- `Typography: PARTIAL`
- `Content: PARTIAL`
- `Visual: PARTIAL`

#### 朋友圈文案 / 精修页

Pencil 当前事实：
- `hero -> previewPanel -> editorPanel -> bottomRow`
- 关键字号：
  - hero title `18px`
  - panel title `16px`
  - body `12px`
  - button `14px`

当前代码事实：
- 页面结构接近
- 但仍需逐项核对列表、编辑区、按钮和滚动条细节

状态：
- `Structure: PARTIAL`
- `Typography: PARTIAL`
- `Content: PARTIAL`
- `Visual: PARTIAL`

## 当前批次 Upload Gate 结论

本轮重跑后的结论：
- `Upload Eligible = No`

原因：
- `Home` 和 `Workflow` 仍存在结构级不一致
- 当前批次不满足“截图级验收通过后再上传”的 gate

## 下一步顺序

只允许按下面顺序继续：

1. 重写 `Home` 到当前 Pencil 结构
2. 重写 `Workflow` 到当前 Pencil 结构
3. 对 `14/15` 做逐项节点核对
4. 本地截图验收
5. 重新上传新的验收批次

