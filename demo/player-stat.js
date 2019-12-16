import OnePlayer from '../src/index'
// import OnePlayer from '../dist/one-player'
import Hls from 'hls.js'
import _ from 'lodash'

function getUTCTimezone () {
  let offset = new Date().getTimezoneOffset() / 60
  if (offset <= 0) {
    return `UTC+${Math.abs(offset)}`
  }
  return `UTC-${Math.abs(offset)}`
}
const NAME = 'IGGFE_PLAYER_STAT'
const ACTION_TYPE = {
  INIT: {
    CODE: 0,
    TEXT: '初始清晰度'
  },
  CHANGE_QUALITY: {
    CODE: 1,
    TEXT: '切换清晰度'
  },
  RELOAD: {
    CODE: 2,
    TEXT: 'reload'
  }
}
const VIDEO_TYPE = {
  LIVE: {
    CODE: 0,
    TEXT: '直播'
  },
  HISTORY: {
    CODE: 1,
    TEXT: '点播'
  }
}

function getData () {
  let data = window.localStorage.getItem(NAME)
  return data ? JSON.parse(data) : null
}

let currentScript = document.currentScript

export class PlayerStat {
  constructor (data) {
    Object.assign(this, {
      url: window.location.href, // 当前地址
      ua: window.navigator.userAgent, // useragent
      timezone: getUTCTimezone(), // 时区
      version: OnePlayer.VERSION, // 播放器版本
      pagePerformance: window.performance, // docment performance
      currentScriptPerformance: '', // 当前脚本performance
      type: VIDEO_TYPE.HISTORY.CODE,
      lang: '',
      userId: '', // 当前用户uin
      anchorId: '', // 主播uin
      pageEnterTime: '', // 页面进入时间
      pageLeaveTime: '', // 页面离开时间
      log: [],
      playSession: []
    }, data)
    if (currentScript) {
      this.currentScriptPerformance = window.performance.getEntriesByName(currentScript.src)[0]
    }
    this._onBeforeUnloadListener = () => {
      this.triggerPageLeave()
    }
    window.addEventListener('beforeunload', this._onBeforeUnloadListener)
  }

  addSession (src, action = ACTION_TYPE.INIT.CODE) {
    this.fixCurrentSessionPlayAndLagTime(Date.now())
    this.playSession.push({
      action: action,
      src: src, // m3u8
      srcPerformance: '', // m3u8 performance
      firstFrameTime: '', // 首帧时间
      loadStartTime: '', // 开始加载视频时间
      canPlayTime: '', // 可以播放时间
      playTimes: [], // 播放时间
      lagTimes: [] // 卡顿时间
    })
    this.addLog(`[action:${action}][src:${src}]`)
  }

  getCurrentSession () {
    if (!this.playSession.length) {
      return null
    }
    return this.playSession[this.playSession.length - 1]
  }

  setAnchorId (v) {
    this.anchorId = v
  }

  setVideoTypeAsLive () {
    this.type = VIDEO_TYPE.LIVE.CODE
  }

  setFirstFrameTime () {
    let currentSession = this.getCurrentSession()
    if (!currentSession) {
      return
    }
    currentSession.firstFrameTime = Date.now()
    this.addLog('首帧')
  }

  setCanPlayTime () {
    let currentSession = this.getCurrentSession()
    if (!currentSession) {
      return
    }
    currentSession.canPlayTime = currentSession.canPlayTime || Date.now()
    this.addLog('可播放')
  }

  setLoadStartTime () {
    let currentSession = this.getCurrentSession()
    if (!currentSession) {
      return
    }
    currentSession.loadStartTime = Date.now()
    this.addLog('开始请求视频')
  }

  triggerPageEnter () {
    this.pageEnterTime = Date.now()
    this.addLog('页面打开')
  }

  triggerPageLeave () {
    window.removeEventListener('beforeunload', this._onBeforeUnloadListener)
    this.pageLeaveTime = Date.now()
    this.fixCurrentSessionPlayAndLagTime(this.pageLeaveTime)
    this.addLog('页面离开')
    this.report()
  }

  addStartPlayTime () {
    let currentSession = this.getCurrentSession()
    if (!currentSession) {
      return
    }
    let lastOne = currentSession.playTimes[currentSession.playTimes.length - 1]
    if (lastOne && !lastOne.end) { // 上一次未结束
      return
    }
    currentSession.playTimes.push({
      start: Date.now()
    })
    this.addLog('开始播放')
  }

  fixCurrentSessionPlayAndLagTime (time) {
    let currentSession = this.getCurrentSession()
    if (!currentSession) {
      return
    }
    let lastPlayOne = currentSession.playTimes[currentSession.playTimes.length - 1]
    let lastLagOne = currentSession.lagTimes[currentSession.lagTimes.length - 1]
    if (lastPlayOne) {
      lastPlayOne.end = lastPlayOne.end || time
    }
    if (lastLagOne) {
      lastLagOne.end = lastLagOne.end || time
    }
  }

  addStopPlayTime () {
    let currentSession = this.getCurrentSession()
    if (!currentSession) {
      return
    }
    let lastOne = currentSession.playTimes[currentSession.playTimes.length - 1]
    if (!lastOne) { // 没有记录
      return
    }
    lastOne.end = Date.now()
    this.addLog('暂停播放')
  }

  addStartLagTime () {
    let currentSession = this.getCurrentSession()
    if (!currentSession) {
      return
    }
    let lastOne = currentSession.lagTimes[currentSession.lagTimes.length - 1]
    if (!lastOne || lastOne.end) { // 确定上次一结束
      currentSession.lagTimes.push({
        start: Date.now()
      })
      this.addLog('开始卡顿')
    }
  }

  addStopLagTime () {
    let currentSession = this.getCurrentSession()
    if (!currentSession) {
      return
    }
    let lastOne = currentSession.lagTimes[currentSession.lagTimes.length - 1]
    if (!lastOne) { // 没有记录
      return
    }
    lastOne.end = Date.now()
    this.addLog('停止卡顿')
  }

  triggerFetchSrcStart () {
    this.addLog('请求接口')
  }

  triggerFetchSrcEnd () {
    this.addLog('接口返回')
  }

  triggerFetchError (message) {
    this.addLog(message)
  }

  addSrcPerformance () {
    if (!this.playSession.length) {
      return
    }
    let grouped = _.groupBy(this.playSession, (session) => {
      return session.src
    })
    _.forIn(grouped, (v, k) => {
      let srcPerformance = window.performance.getEntriesByName(k)
      v.forEach((s, i) => {
        s.srcPerformance = srcPerformance[i]
      })
    })
  }

  createSaveData () {
    let data = {}
    Object.assign(data, this)
    data.player = null
    return data
  }

  report () {
    this.addSrcPerformance()
    let data = getData() || []
    data.push(this.createSaveData())
    // window.localStorage.setItem(NAME, JSON.stringify(data))
    // report()
  }

  initPlayer (player) {
    if (this.player) {
      return
    }
    this.player = player
    this.addSession(player.getCurrentUrl(), ACTION_TYPE.INIT.CODE)
    player.on('loadeddata', (evt) => {
      this.setFirstFrameTime()
    })
    player.on('canplay', (evt) => {
      this.setCanPlayTime()
    })
    player.on('loadstart', (evt) => {
      this.setLoadStartTime()
    })
    player.on('playing', (evt) => {
      this.addStartPlayTime()
      this.addStopLagTime()
    })
    player.on('pause', (evt) => {
      this.addStopPlayTime()
    })
    player.on('error', (evt) => {
      this.addLog(evt.message)
    })
    player.on(Hls.Events.ERROR, (evt, data) => { // 卡顿
      this.addLog(data.details)
      switch (data.details) {
        case Hls.ErrorDetails.BUFFER_STALLED_ERROR:
          this.addStartLagTime()
          break
        default:
          break
      }
    })
    player.on(OnePlayer.EVENTS.RELOAD, () => {
      this.addSession(player.getCurrentUrl(), ACTION_TYPE.RELOAD.CODE)
      this.report()
    })
    player.on(OnePlayer.EVENTS.QUALITY_CHANGE, (evt) => {
      this.addSession(player.getCurrentUrl(), ACTION_TYPE.CHANGE_QUALITY.CODE)
    })
  }

  addLog (content) {
    let log = `[${Date.now()}]${content}`
    this.log.push(log)
  }
}

export function removeData () {
  window.localStorage.removeItem(NAME)
}

export function report () {
  // let data = getData()
  // if (!data || isReporting) {
  //   return
  // }
  // isReporting = true
}
