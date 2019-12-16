import 'custom-event-polyfill'
import Template from './template'
import ToolTip from './tool-tip'
import ControlBar from './control-bar'
import Quality from './quality'
import Bezel from './bezel'
import Cover from './cover'
import Live from './live'
import DanMu from './dan-mu'
import ContextMenu from './context-menu'
import Stats from './stats'
import Plugin, { addPlugin, initPlugins } from './plugin'
import EVENTS, { FULLSCREEN_EVENTS, START_WAITING_EVENTS, END_WAITING_EVENTS } from './events'
import { isFullScreen, isM3U8, findIndex, isObject, bind, getElementWidth, getElementHeight, ResizeObserver } from './utils'
import defaultConfig from './config'
import { AutoBindMethod } from './base'

export default class Player extends AutoBindMethod {
  constructor (opt) {
    super()
    this._initOpt(opt)
    this._initHls()
    this._initComponents()
    this._initListener()
    this._initData()
    this._initPlugins()
    this.emit(EVENTS.READY)
  }

  _initPlugins () {
    initPlugins(this)
  }

  _initComponents () {
    this.template = new Template(this)
    this.video = this.template.video
    this.toolTip = new ToolTip(this)
    this.controlBar = new ControlBar(this)
    this.bezel = new Bezel(this)
    this.quality = new Quality(this)
    this.contextMenu = new ContextMenu(this)
    this.stats = new Stats(this)
    if (this.opt.cover) {
      this.cover = new Cover(this)
    }
    if (this.opt.live) {
      this.live = new Live(this)
    }
    if (this.opt.danMu.enable) {
      this.danMu = new DanMu(this)
    }
  }

  _initData () {
    this.setVolume(this.opt.initVolume, true)
  }

  _initOpt (opt) {
    this.opt = Object.assign({}, defaultConfig, opt)
    Object.keys(defaultConfig).forEach(k => {
      if (isObject(defaultConfig[k])) { // 只做1级拷贝
        this.opt[k] = Object.assign({}, defaultConfig[k], this.opt[k])
      }
    })
  }

  _initHls () {
    if (!this.opt.hls || !this.opt.hls.class) {
      return
    }
    this._Hls = this.opt.hls.class
    this._hls = new this._Hls(this.opt.hls)
  }

  _initListener () {
    this._initVideoClickListener()
    this._initFullscreenChangeListener()
    this._initVolumeChangeListener()
    this._initTimeoutListener()
    this._initUserActionChangeListener()
    this._initVideoSizeChangeListener()
    this._initAutoPlayListener()
    this._initErrorListener()
  }

  _startAutoReloadListener () {
    this._clearAutoReloadListener()
    this._autoReload = 0
    this._autoReloadListener = setInterval(() => {
      this._autoReload = this._autoReload + 1
      if (this._autoReload >= this.opt.autoReload) {
        this._triggerAutoRecoverTimeout()
      }
    }, 1000)
  }

  _triggerAutoRecoverTimeout () {
    this._clearAutoReloadListener()
    this.reload(true)
  }

  _clearAutoReloadListener () {
    if (this._autoReloadListener) {
      clearInterval(this._autoReloadListener)
    }
    this._autoReloadListener = null
  }

  _stopAutoReloadListener () {
    this._clearAutoReloadListener()
  }

  _initErrorListener () {
    this.on('error', (evt) => {
      const error = evt.target.error
      this.emit(EVENTS.ERROR, {
        message: `[${error.code}][${error.message}]`
      })
    })
    if (this._Hls) {
      this.on(this._Hls.Events.ERROR, (evt, data) => {
        this.emit(EVENTS.ERROR, {
          message: `[${evt}][${data.type}][${data.fatal}][${data.details}]`
        })
        if (!data.fatal) {
          return
        }
        switch (data.type) {
          case this._Hls.ErrorTypes.NETWORK_ERROR:
            if (this.opt.autoReload) this._hls.startLoad()
            break
          case this._Hls.ErrorTypes.MEDIA_ERROR:
            this._handleMediaError()
            break
          default:
            this._destroyHls()
            break
        }
      })
    }
  }

  _handleMediaError () {
    if (!this._hls) {
      return
    }
    this._hls.recoverMediaError()
  }

  _initVideoSizeChangeListener () {
    const ro = new ResizeObserver(entries => {
      this.emit(EVENTS.VIDEO_SIZE_CHANGE, {
        width: getElementWidth(this.video),
        height: getElementHeight(this.video)
      })
    })
    ro.observe(this.video)
  }

  _initUserActionChangeListener () {
    let ignoreEmptied = false
    if (this._needAutoReload()) { // auto reload ignore emptied
      this.on(EVENTS.BEFORE_AUTO_RELOAD, () => {
        ignoreEmptied = true
      })
      this.on('loadstart', () => {
        ignoreEmptied = false
      })
    }
    this.on(['pause', 'ended'], () => {
      this._triggerUserActiveChange(true)
    })
    this.on('emptied', () => {
      if (!ignoreEmptied) {
        this._triggerUserActiveChange(true)
      }
    })
    this.on('play', () => {
      this._onPlay()
    })
    bind(this.template.playerWhole, 'mousemove', this._onMouseMoveListener)
    bind(this.template.playerWhole, 'mouseleave', this._onMouseLeaveListener)
    this.on(EVENTS.DRAG_END, this._onMouseLeaveListener)
  }

  _triggerUserActiveChange (isActive) {
    this._stopUserActionChangeListener()
    if (isActive === this._isUserActive) {
      return
    }
    this._isUserActive = isActive
    this.emit(EVENTS.USER_ACTIVE_CHANGE, {
      active: this._isUserActive
    })
    if (this.opt.canFull) {
      if (isFullScreen() && !isActive) {
        this.template.playerWhole.classList.add('one-player-no-cursor')
      } else {
        this.template.playerWhole.classList.remove('one-player-no-cursor')
      }
    }
  }

  _startUserActionChangeListener () {
    this._stopUserActionChangeListener()
    this._userActionTime = 0
    this._userActionChangeListener = setInterval(() => {
      this._userActionTime = this._userActionTime + 1
      if (this._userActionTime >= this.opt.userActionChangeTime) {
        this._triggerUserActiveChange(false)
      }
    }, 1000)
  }

  _onPlay () {
    if (this.controlBar.isActive()) {
      return
    }
    this._startUserActionChangeListener()
  }

  _onMouseMoveListener () {
    if (this.isPaused()) {
      return
    }
    this._triggerUserActiveChange(true)
    if (this.controlBar.isActive()) {
      return
    }
    this._startUserActionChangeListener()
  }

  _onMouseLeaveListener () {
    if (isFullScreen()) {
      return
    }
    if (this.isPaused()) {
      return
    }
    if (this.controlBar.isActive()) {
      return
    }
    this._triggerUserActiveChange(false)
  }

  _stopUserActionChangeListener () {
    if (this._userActionChangeListener) {
      clearInterval(this._userActionChangeListener)
    }
    this._userActionChangeListener = null
  }

  _needAutoReload () {
    return this.opt.autoReload && this.live
  }

  _triggerTimeout () {
    this.emit(EVENTS.TIMEOUT)
    this._clearTimeoutListener()
    if (this._needAutoReload()) {
      this._startAutoReloadListener()
    }
  }

  _startTimeoutListener () {
    this._clearTimeoutListener()
    this._timeout = 0
    this._timeoutListener = setInterval(() => {
      this._timeout = this._timeout + 1
      if (this._isTimeout()) {
        this._triggerTimeout()
      }
    }, 1000)
  }

  _isTimeout () {
    return this._timeout >= this.opt.timeout
  }

  _clearTimeoutListener () {
    if (this._timeoutListener) {
      clearInterval(this._timeoutListener)
    }
    this._timeoutListener = null
  }

  _stopTimeoutListener (evt) {
    this.emit(EVENTS.STOP_TIMEOUT)
    this._clearTimeoutListener()
    if (this._needAutoReload()) {
      this._stopAutoReloadListener()
    }
  }

  _initTimeoutListener () {
    this.on(START_WAITING_EVENTS, this._startTimeoutListener)
    this.on(END_WAITING_EVENTS, this._stopTimeoutListener)
  }

  _initVideoClickListener () {
    bind(this.template.videoMask, 'click', (evt) => {
      this.emit(EVENTS.CLICK_VIDEO)
      if (this.opt.togglePlayOnClickVideo) {
        this.toggle()
      }
    })
  }

  _initAutoPlayListener () {
    /*
    * 如果无法自动播放，则切换到静音自动播放模式
    * */
    if (this.opt.autoPlay && !this.opt.muted) {
      this.on('loadeddata', () => {
        if (this.isPaused()) {
          this.mute(true)
          this.play()
          this.emit(EVENTS.BROWSER_AUTO_PLAY_BLOCKED)
          this._startDocMutedListener()
        }
      })
    }
  }

  _startDocMutedListener () {
    bind(document, 'click', this._docMutedListener)
  }

  _docMutedListener () {
    if (!this.video.muted) {
      this._stopDocMutedListener()
      return
    }
    this.mute(false)
  }

  _stopDocMutedListener () {
    document.removeEventListener('click', this._docMutedListener)
  }

  _initVolumeChangeListener () {
    this.on('volumechange', () => {
      this.emit(EVENTS.VOLUME_CHANGE, {
        volume: this.video.volume
      })
    })
  }

  _initFullscreenChangeListener () {
    if (this.opt.canFull) {
      bind(this.template.videoMask, 'dblclick', this.toggleFullScreen)
    }
    bind(document, FULLSCREEN_EVENTS, this._onFullscreenChangeListener)
  }

  _onFullscreenChangeListener () {
    this.emit(EVENTS.FULLSCREEN_CHANGE, {
      fullScreen: isFullScreen()
    })
  }

  _stopFullscreenListener () {
    FULLSCREEN_EVENTS.forEach((v) => {
      document.removeEventListener(v, this._onFullscreenChangeListener)
    })
  }

  _onOne (...args) {
    if (!args || !args.length) {
      return this
    }
    const type = args[0]
    if (!type) {
      return this
    }
    if (type.indexOf('hls') === 0 && this._hls) { // bind hls events
      if (this.opt.debug && type !== EVENTS.EVENT) {
        const self = this
        const handler = args[1]
        args[1] = function (...params) {
          self.emit(EVENTS.EVENT, {
            type
          })
          handler(...params)
        }
      }
      this._hls.on(...args)
      return this
    }
    bind(this.video, ...args)
    return this
  }

  on (...args) {
    if (!args || !args.length) {
      return this
    }
    const type = args[0]
    if (!Array.isArray(type)) {
      return this._onOne(...args)
    }
    type.forEach((v) => {
      const arg = args.slice(1)
      arg.unshift(v)
      this._onOne(...arg)
    })
    return this
  }

  dispatchEvent (type, detail = null) {
    const evt = new window.CustomEvent(type, {
      detail
    })
    this.video.dispatchEvent(evt)
  }

  emit (type, detail = null) {
    this.dispatchEvent(type, detail)
    if (this.opt.debug && type !== EVENTS.EVENT) {
      this.dispatchEvent(EVENTS.EVENT, {
        type
      })
    }
  }

  load (url) {
    if (!isNaN(url)) {
      this._loadQuality(url)
      return
    }
    if (Array.isArray(this.opt.quality) && this.opt.quality.length) {
      const index = findIndex(this.opt.quality, (v) => {
        return v.url === url
      })

      if (index !== -1) {
        this._loadQuality(index)
        return
      }
    }
    this.loadUrl(url)
  }

  loadUrl (url) {
    if (url !== this._url) {
      this.emit(EVENTS.SOURCE_CHANGE, {
        source: url
      })
    }
    this._url = url
    this._loadMedia(url)
    this.emit(EVENTS.LOAD)
  }

  getCurrentUrl () {
    return this._url
  }

  _loadQuality (index) {
    if (!this.opt.quality) {
      return
    }
    const target = this.opt.quality[index]
    if (!target || !target.url) {
      return
    }
    this.quality.change(index)
  }

  switch (url) {
    if (!isM3U8(url)) {
      this._destroyHls()
    } else {
      this._initHls()
    }
    this.loadUrl(url)
  }

  _loadMedia (url) {
    if (isM3U8(url)) {
      this._loadHlsMedia(url)
      return
    }
    this._loadOtherMedia(url)
  }

  _loadOtherMedia (url) {
    this.video.setAttribute('src', url)
  }

  _loadHlsMedia (url) {
    if (!this._hls || !this._Hls.isSupported()) {
      this._loadOtherMedia(url)
      return
    }
    this._hls.loadSource(url)
    this._hls.attachMedia(this.video)
  }

  toggle () {
    if (!this.isPaused()) {
      this.pause()
      return
    }
    if (this.opt.live && this.opt.reloadOnReplayInLiveMode) {
      this.reload()
      return
    }
    this.play()
  }

  play () {
    const p = this.video.play()
    if (p) {
      p.catch((e) => {})
    }
  }

  pause () {
    this.video.pause()
  }

  setTime (time) {
    this.video.currentTime = time
  }

  isPaused () {
    return !!this.video.paused
  }

  setFullScreenElement (el) {
    this._fullScreenElement = el
  }

  resetFullScreenElement () {
    this._fullScreenElement = null
  }

  fullScreen () {
    const whole = this._fullScreenElement || this.template.playerWhole
    const requestFullscreen = whole.requestFullscreen || whole.webkitRequestFullscreen || whole.mozRequestFullScreen || whole.msRequestFullscreen
    if (requestFullscreen) {
      requestFullscreen.call(whole)
      return this
    }
    if (this.video.webkitEnterFullScreen) {
      this.video.webkitEnterFullScreen()
    }
    return this
  }

  cancelFullScreen () {
    const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen
    if (!exitFullscreen) {
      return
    }
    exitFullscreen.call(document)
  }

  toggleFullScreen () {
    if (isFullScreen()) {
      this.cancelFullScreen()
      return
    }
    this.fullScreen()
  }

  getVolume () {
    return this.video.volume
  }

  setVolume (v, notChangeMute) {
    if (isNaN(v)) {
      return
    }
    this.video.volume = v
    if (!notChangeMute) {
      this.mute(v === 0)
    }
  }

  isMuted () {
    return this.video.muted
  }

  toggleMute () {
    this.mute(!this.video.muted)
  }

  mute (b = true) {
    this.video.muted = b
  }

  reload (autoReload) {
    if (autoReload) {
      this.emit(EVENTS.BEFORE_AUTO_RELOAD)
    }
    this.loadUrl(this._url)
    this.play()
    if (autoReload) {
      this.emit(EVENTS.AUTO_RELOAD)
      return
    }
    this.emit(EVENTS.RELOAD)
  }

  destroy () {
    this.emit(EVENTS.BEFORE_DESTROY)
    this._destroyHls()
    this._stopTimeoutListener()
    this._stopFullscreenListener()
    this._stopDocMutedListener()
    this._clearContainer()
    this.emit(EVENTS.DESTROY)
  }

  _clearContainer () {
    this.opt.container.innerHTML = ''
  }

  _destroyHls () {
    if (this._hls) {
      this._hls.destroy()
    }
  }

  reduceQuality () {
    this.quality.reduce()
  }

  hasQuality () {
    const quality = this.opt.quality
    if (!quality || !quality.length) {
      return false
    }
    return true
  }

  isLastQuality () {
    return this.quality.isLast()
  }

  appendDanMu (list, isPriority = false) {
    if (!this.danMu) {
      return this
    }
    this.danMu.append(list, isPriority)
    return this
  }

  toggleDanMu () {
    if (!this.danMu) {
      return this
    }
    this.danMu.toggle()
    return this
  }

  showDanMu () {
    if (!this.danMu) {
      return this
    }
    this.danMu.show()
    return this
  }

  hideDanMu () {
    if (!this.danMu) {
      return this
    }
    this.danMu.hide()
    return this
  }

  configDanMu (opt) {
    if (!this.danMu) {
      return this
    }
    Object.assign(this.opt.danMu, opt)
    return this
  }

  isDanMuVisible () {
    if (!this.danMu) {
      return false
    }
    return this.danMu.isVisible()
  }

  log (...text) {
    if (!this.opt.debug) {
      return
    }
    const info = `[one-player]${text.join(' ')}`
    window.console.log(info)
    this.emit(EVENTS.LOG, {
      info
    })
  }

  showComment () {
    this.controlBar.toggleComment(true)
  }

  hideComment () {
    this.controlBar.toggleComment(false)
  }

  clearComment () {
    this.controlBar.clearComment()
  }

  setComment (v) {
    this.controlBar.setComment(v)
  }

  showMessage (...args) {
    this.bezel.showMessage(...args)
  }

  clearMessage () {
    this.bezel.clearMessage()
  }

  toast (v) {
    const div = document.createElement('div')
    div.classList.add('one-player-toast')
    div.textContent = v
    div.style.animationDuration = `${this.opt.toastDuration}s`
    this.template.playerWhole.appendChild(div)
    setTimeout(() => {
      this.template.playerWhole.removeChild(div)
    }, this.opt.toastDuration * 1000)
  }

  static use (...args) {
    addPlugin(...args)
  }
}

Player.Plugin = Plugin
Player.EVENTS = EVENTS
Player.VERSION = `${VERSION}`
