import { AutoBindMethod } from './base'
import { bind, toggleEl, hideEl } from './utils'
import EVENTS from './events'

export default class Stats extends AutoBindMethod {
  constructor (player) {
    super()
    this.player = player
    this.template = this.player.template
    this.speed = []
    this.maxSpeedPoint = 200
    this._init()
  }

  _init () {
    bind(this.template.statsClose, 'click', this._hide)
    if (!this.player._Hls) {
      return
    }
    this._initViewport()
    this._initResolution()
    this._initFormat()
    this._initSpeed()
    this._initNetwork()
    this._initDroppedFrames()
  }

  _hide () {
    hideEl(this.template.stats)
  }

  toggle () {
    toggleEl(this.template.stats)
  }

  _initResolution () {
    this.player.on('loadedmetadata', (evt) => {
      this.template.statsResolution.textContent = `${evt.target.videoWidth} x ${evt.target.videoHeight}`
    })
  }

  _initDroppedFrames () {
    this.player.on('timeupdate', () => {
      let droppedVideoFrames = ''
      let totalVideoFrames = ''
      if (this.player.video.getVideoPlaybackQuality) {
        const videoPlaybackQuality = this.player.video.getVideoPlaybackQuality()
        droppedVideoFrames = videoPlaybackQuality.droppedVideoFrames
        totalVideoFrames = videoPlaybackQuality.totalVideoFrames
      } else if (this.player.video.webkitDecodedFrameCount) {
        droppedVideoFrames = this.player.video.webkitDroppedFrameCount
        totalVideoFrames = this.player.video.webkitDecodedFrameCount
      }
      this.template.statsDroppedFrames.textContent = `${droppedVideoFrames} / ${totalVideoFrames}`
    })
  }

  _initViewport () {
    this.player.on(EVENTS.VIDEO_SIZE_CHANGE, (evt) => {
      this.template.statsViewport.textContent = `${evt.detail.width} x ${evt.detail.height}`
    })
  }

  _initFormat () {
    this.player.on(EVENTS.SOURCE_CHANGE, (evt) => {
      this.template.statsFormat.textContent = evt.detail.source ? evt.detail.source.replace(/.*\.(.+)$/, '$1').toUpperCase() : ''
    })
  }

  _updateSpeed (kbps) {
    this._addSpeed(kbps)
    this.template.statsSpeed.textContent = `${kbps} KBps`
    this._updateSpeedChart()
    this._startSpeedTimer()
  }

  _clearSpeedTimer () {
    if (this.speedTimer) {
      clearTimeout(this.speedTimer)
    }
  }

  _startSpeedTimer () {
    this._clearSpeedTimer()
    this.speedTimer = setTimeout(() => {
      this._addSpeed(0)
      this.template.statsSpeed.textContent = '0 KBps'
      this._updateSpeedChart()
    }, 10000)
  }

  _addSpeed (v) {
    this.speed.push(v)
    const len = this.speed.length
    if (len > this.maxSpeedPoint) {
      this.speed.shift()
    }
  }

  _clearNetworkTimer () {
    if (this.networkTimer) {
      clearTimeout(this.networkTimer)
    }
  }

  _startNetworkTimer () {
    this._clearNetworkTimer()
    this.networkTimer = setTimeout(() => {
      this.template.statsNetwork.textContent = '0 KB'
    }, 10000)
  }

  _updateSpeedChart () {
    const maxSpeed = 1000 // 最高y对应最大速度
    const maxY = 10
    const points = this.speed.map((v, i) => {
      let y = maxY
      if (v >= maxSpeed) {
        y = 0
      } else {
        y = Math.round(maxY - maxY * v / maxSpeed)
      }
      return `${i} ${y}`
    })
    this.template.statsSpeedChart.querySelector('polyline').setAttribute('points', points.join())
  }

  _updateNetwork (kb) {
    this.template.statsNetwork.textContent = `${kb} KB`
    this._startNetworkTimer()
  }

  _preFillSpeed () {
    if (!this.speed.fill) {
      return
    }
    this.speed = Array(this.maxSpeedPoint).fill(0)
    this._updateSpeedChart()
  }

  _initSpeed () {
    if (!this.player._Hls) {
      return
    }
    this.template.statsSpeedChart.querySelector('svg').setAttribute('viewBox', `0 0 ${this.maxSpeedPoint} 10`)
    this._preFillSpeed()
    this.player.on(this.player._Hls.Events.FRAG_LOADED, (evt, data) => {
      const kb = Math.round(data.stats.loaded / 1024)
      const s = Math.round((data.stats.tload - data.stats.trequest) / 1000) || 1
      const kbps = Math.round(kb / s)
      this._updateSpeed(kbps)
    })
  }

  _initNetwork () {
    if (!this.player._Hls) {
      return
    }
    let loaded = 0
    this.player.on(this.player._Hls.Events.FRAG_LOADING, (evt, data) => {
      loaded = 0
      this._updateNetwork(0)
    })
    this.player.on(this.player._Hls.Events.FRAG_LOAD_PROGRESS, (evt, data) => {
      const kb = Math.round((data.stats.loaded - loaded) / 1024)
      loaded = data.stats.loaded
      this._updateNetwork(kb)
    })
  }
}
