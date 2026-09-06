// 上传素材 — 客户在手机上最自然的动作：拍完就传
//
// 链路：相册/相机 → wx.cloud.uploadFile（微信云存储）→ 云函数 syncMaterial
//       → 中台 upload-urls → PUT 广州 COS → complete 落库
//
// 走微信云存储中转、而不是 wx.uploadFile 直传 COS，是为了不用配「合法域名」
// （配它要域名 ICP 备案 + 人去微信后台点）。客户装上就能用，零配置。
//
// ── 一条纪律 ──────────────────────────────────────────────────────────
// 逐个文件报结果，不做「全部成功/全部失败」的粗判。传 9 张成了 8 张，
// 必须让人看出是哪一张没成、为什么——否则只能整批重来。

const MAX_COUNT = 9

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
    // 每条：{ name, status: pending|uploading|done|failed|deduped, message }
    jobs: [],
    doneCount: 0,
    failCount: 0
  },

  onChooseImage() { this.pick('image') },
  onChooseVideo() { this.pick('video') },

  pick(kind) {
    if (this.data.busy) return
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
    const jobs = files.map((f, i) => {
      const name = guessFileName(f, i, kind)
      return { name: name, status: 'pending', message: '等待上传' }
    })
    this.setData({ busy: true, jobs: jobs, doneCount: 0, failCount: 0 })

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

  /** 传一个文件。每一步失败都写进这条 job，不影响别的文件继续。 */
  async one(file, index, kind) {
    const job = this.data.jobs[index]
    const key = 'jobs[' + index + ']'
    const set = (status, message) => this.setData({ [key + '.status']: status, [key + '.message']: message })

    set('uploading', '上传中…')

    // ① 先进微信云存储。cloudPath 带时间戳避免同名覆盖。
    let fileID
    try {
      const up = await new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: 'materials/' + Date.now() + '_' + index + '_' + job.name,
          filePath: file.tempFilePath,
          success: resolve,
          fail: reject
        })
      })
      fileID = up.fileID
    } catch (err) {
      set('failed', '传到微信云存储失败：' + ((err && err.errMsg) || '未知'))
      this.setData({ failCount: this.data.failCount + 1 })
      return
    }

    set('uploading', '同步到素材库…')

    // ② 云函数搬进中台。它内部再走 换地址 → PUT COS → 落库 三步。
    let r
    try {
      const res = await new Promise((resolve, reject) => {
        wx.cloud.callFunction({
          name: 'syncMaterial',
          data: { fileID: fileID, fileName: job.name, mimeType: guessMime(job.name, kind) },
          success: resolve,
          fail: reject
        })
      })
      r = (res && res.result) || {}
    } catch (err) {
      // 云函数没部署时走这里，说人话
      set('failed', '调不到同步云函数：' + ((err && err.errMsg) || '未知'))
      this.setData({ failCount: this.data.failCount + 1 })
      return
    }

    if (!r.ok) {
      // 云函数已经区分了「没配置 / 连不上 / 凭据被拒 / 已进存储但没落库」，原样显示
      set('failed', (r.code || 'FAILED') + '：' + (r.message || '同步失败'))
      this.setData({ failCount: this.data.failCount + 1 })
      return
    }

    if (r.deduped) {
      // 去重命中不是错误——这张之前传过，服务端认出来了
      set('deduped', '这张之前传过，已跳过')
    } else {
      set('done', '已进素材库')
    }
    this.setData({ doneCount: this.data.doneCount + 1 })
  },

  onGoMaterials() {
    wx.switchTab({ url: '/pages/materials/materials' })
  }
})
