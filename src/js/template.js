import tplPlayer from '../template/player.art'
import icon from './icon'

export default class Template {
  constructor (player) {
    this.player = player
    this.data = Object.assign(this.player.opt, {
      icon
    })
    this.container = this.player.opt.container
    this._render()
  }

  _render () {
    this.container.innerHTML = tplPlayer(this.data)
    this.playerWhole = this.container.querySelector('.one-player')
    this.video = this.container.querySelector('video')
    this.videoMask = this.container.querySelector('.one-player--video-mask')
    this.cover = this.container.querySelector('.one-player--cover')
    this.live = this.container.querySelector('.one-player--live')
    this.toolTip = this.container.querySelector('.one-player--tool-tip')
    this.playButton = this.container.querySelector('.one-player--play-button')
    this.bezel = this.container.querySelector('.one-player--bezel')
    this.loading = this.container.querySelector('.one-player--loading')
    this.messageTip = this.container.querySelector('.one-player--message-tip span')
    this.messageHandleButton = this.container.querySelector('.one-player--message-tip strong')
    this.bezelPlayStatus = this.container.querySelector('.one-player--bezel-play-status')
    this.controlBar = this.container.querySelector('.one-player--control-bar')
    this.progress = this.container.querySelector('.one-player--progress')
    this.progressLoaded = this.container.querySelector('.one-player--progress-loaded')
    this.progressHover = this.container.querySelector('.one-player--progress-hover')
    this.progressPlay = this.container.querySelector('.one-player--progress-play')
    this.progressDrag = this.container.querySelector('.one-player--progress-drag')
    this.time = this.container.querySelector('.one-player--time')
    this.currentTime = this.container.querySelector('.one-player--current-time')
    this.totalTime = this.container.querySelector('.one-player--total-time')
    this.countdown = this.container.querySelector('.one-player--countdown')
    this.fullButton = this.container.querySelector('.one-player--full-button')
    this.volumeButton = this.container.querySelector('.one-player--volume-button')
    this.freshButton = this.container.querySelector('.one-player--fresh-button')
    this.volume = this.container.querySelector('.one-player--volume')
    this.volumeProgress = this.container.querySelector('.one-player--volume-progress')
    this.volumeProgressNow = this.container.querySelector('.one-player--volume-progress-now')
    this.volumeProgressDrag = this.container.querySelector('.one-player--volume-progress-drag')
    this.quality = this.container.querySelector('.one-player--quality')
    this.qualityActive = this.container.querySelector('.one-player--quality-active')
    this.qualityList = this.container.querySelector('.one-player--quality-list')
    this.danMu = this.container.querySelector('.one-player--dan-mu')
    this.danMuButton = this.container.querySelector('.one-player--dan-mu-button')
    this.comment = this.container.querySelector('.one-player--control-item-comment')
    this.commentInput = this.container.querySelector('.one-player--control-item-comment input')
    this.commentButton = this.container.querySelector('.one-player--control-item-comment button')
    this.contextMenu = this.container.querySelector('.one-player--context-menu')
    this.contextMenuVersion = this.container.querySelector('.one-player--context-menu-version')
    this.contextMenuStats = this.container.querySelector('.one-player--context-menu-stats')
    this.contextMenuPip = this.container.querySelector('.one-player--context-menu-pip')
    this.contextMenuReset = this.container.querySelector('.one-player--context-menu-reset')
    this.contextMenuCopyUrl = this.container.querySelector('.one-player--context-menu-copy-url')
    this.stats = this.container.querySelector('.one-player--stats')
    this.statsClose = this.container.querySelector('.one-player--stats-close')
    this.statsResolution = this.container.querySelector('.one-player--stats-resolution')
    this.statsDroppedFrames = this.container.querySelector('.one-player--stats-dropped-frames')
    this.statsViewport = this.container.querySelector('.one-player--stats-viewport')
    this.statsFormat = this.container.querySelector('.one-player--stats-format')
    this.statsSpeed = this.container.querySelector('.one-player--stats-speed')
    this.statsSpeedChart = this.container.querySelector('.one-player--stats-speed-chart')
    this.statsNetwork = this.container.querySelector('.one-player--stats-network')
  }
}
