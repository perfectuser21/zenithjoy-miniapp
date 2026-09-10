// 上传素材 — 客户在手机上最自然的动作：拍完就传
//
// 链路：相册/相机 → 读成 ArrayBuffer → 中台换预签名地址 → PUT 直进广州 COS
//       → 回中台落库。文件本体不经过中台，也不经过微信云存储（见 utils/zj-api.js）。
//
// ── 一条纪律 ──────────────────────────────────────────────────────────
// 逐个文件报结果，不做「全部成功/全部失败」的粗判。传 9 张成了 8 张，
// 必须让人看出是哪一张没成、为什么——否则只能整批重来。

const api = require('../../utils/zj-api.js')

const MAX_COUNT = 9

// 小程序把文件整个读进内存再 PUT，太大的视频会把内存吃爆。
// 卡在选完之后、读之前，比读到一半崩掉体验好得多。大视频走电脑端上传。
const MAX_BYTES = 200 * 1024 * 1024

/** 从 wx.chooseMedia 的返回里凑出一个像样的文件名。相册给的临时路径没有原名。 */
function guessFileName(file, index, kind) {
  const path = file.tempFilePath || ''
  const m = /\.([a-zA-Z0-9]{1,5})$/.exec(path)
  const ext = m ? m[1].toLowerCase() : (kind === 'video' ? 'mp4' : 'jpg')
  const t = new Date()
  const pad = (n) => (n < 10 ? '0' + n : '' + n)
  const stamp = t.getFullYear() + pad(t.getMonth() + 1) + pad(t.getDate()) +
    '_' + pad(t.getHours()) + pad(t.getMinutes()) + pad(t.getSeconds())
  return 'MP_' + stamp + '_' + (index + 1) + '.' + ext
}

function guessMime(fileName, kind) {
  const ext = (fileName.split('.').pop() || '').toLowerCase()
  if (kind === 'video') {
    if (ext === 'mov') return 'video/quicktime'
    return 'video/mp4'
  }
  if (ext === 'png') return 'image/png'
  if (ext === 'heic') return 'image/heic'
  return 'image/jpeg'
}

Page({
  data: {
    busy: false,
    hasToken: true,
    // 每条：{ name, status: pending|uploading|done|failed|deduped, message }
    jobs: [],
    doneCount: 0,
    failCount: 0,
    // 本批第一个传成文件的作品 id，「去发布」入口用。
    // 现状：zj-api.uploadFile 逐文件调 complete，中台给每个文件各建一个作品、
    // 各回一个 content_id——一次传多张图不是合成一单，所以这里只带第一个成功的。
    // 多文件合单要中台侧改 complete 协议，端上不猜。
    publishContentId: ''
  },

  onShow() {
    // 没填凭据就别让人先选完 9 张照片再报错
    this.setData({ hasToken: Boolean(api.getToken()) })
  },

  onGoToken() {
    wx.switchTab({ url: '/pages/user/user' })
  },

  onChooseImage() { this.pick('image') },
  onChooseVideo() { this.pick('video') },

  pick(kind) {
    if (this.data.busy) return
    if (!this.data.hasToken) { this.onGoToken(); return }
    wx.chooseMedia({
      count: kind === 'video' ? 1 : MAX_COUNT,
      mediaType: [kind],
      sourceType: ['album', 'camera'],
      sizeType: ['original'],          // 要原图，压缩过的素材没法用来做作品
      success: (res) => this.run(res.tempFiles || [], kind),
      fail: (err) => {
        // 用户自己取消不算错误，不要弹提示吓人
        if (err && /cancel/i.test(err.errMsg || '')) return
        wx.showToast({ title: '选择失败', icon: 'none' })
      }
    })
  },

  async run(files, kind) {
    if (!files.length) return
    const jobs = files.map((f, i) => ({
      name: guessFileName(f, i, kind),
      status: 'pending',
      message: '等待上传'
    }))
    this.setData({ busy: true, jobs: jobs, doneCount: 0, failCount: 0, publishContentId: '' })

    for (let i = 0; i < files.length; i++) {
      await this.one(files[i], i, kind)
    }

    this.setData({ busy: false })
    const { doneCount, failCount } = this.data
    wx.showToast({
      title: failCount === 0 ? ('已上传 ' + doneCount + ' 个') : (doneCount + ' 成功 / ' + failCount + ' 失败'),
      icon: failCount === 0 ? 'success' : 'none'
    })
  },

  /** 传一个文件。失败只影响这一条，别的文件继续。 */
  async one(file, index, kind) {
    const job = this.data.jobs[index]
    const key = 'jobs[' + index + ']'
    const set = (status, message) => this.setData({ [key + '.status']: status, [key + '.message']: message })
    const markFail = (msg) => {
      set('failed', msg)
      this.setData({ failCount: this.data.failCount + 1 })
    }

    if (file.size && file.size > MAX_BYTES) {
      markFail('文件太大（' + (file.size / 1024 / 1024).toFixed(0) + 'MB），手机端最多 200MB，大文件用电脑传')
      return
    }

    set('uploading', '上传中…')

    let r
    try {
      r = await api.uploadFile({
        filePath: file.tempFilePath,
        fileName: job.name,
        mimeType: guessMime(job.name, kind)
      })
    } catch (e) {
      // zj-api 已经区分了读不到 / 空文件 / 换地址失败 / 进存储失败 /
      // 已进存储但没落库，原样显示，不要糊成「上传失败」
      markFail((e.code || 'FAILED') + '：' + (e.message || '上传失败'))
      return
    }

    if (r.deduped) {
      // 去重命中不是错误——这张之前传过，服务端认出来了
      set('deduped', '这张之前传过，已跳过')
    } else {
      set('done', '已进素材库')
    }
    this.setData({ doneCount: this.data.doneCount + 1 })
    if (!this.data.publishContentId && r.contentId) {
      this.setData({ publishContentId: r.contentId })
    }
  },

  onGoMaterials() {
    wx.switchTab({ url: '/pages/materials/materials' })
  },

  onGoPublish() {
    const id = this.data.publishContentId
    if (!id) return
    wx.navigateTo({ url: '/pages/publish/publish?content_id=' + id })
  }
})
