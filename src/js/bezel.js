import EVENTS, { START_WAITING_EVENTS, END_WAITING_EVENTS } from './events'
import icon from './icon'
import { bind } from './utils'
import { AutoBindMethod } from './base'

export default class Bezel extends AutoBindMethod {
  constructor (player) {
    super()
    this.player = player
    this.template = this.player.template
    this._initListener()
  }

  _initListener () {
    this._initPlay()
    this._initLoading()
    this._initTimeout()
    this._initErrorTip()
  }

  _initPlay () {
    if (this.player.opt.togglePlayOnClickVideo) {
      this.player.on(EVENTS.CLICK_VIDEO, () => {
        this.template.bezelPlayStatus.innerHTML = this.player.isPaused()
          ? icon.pause
          : icon.play
        this.template.bezel.classList.add('one-player--bezel-show-play')
      })
      bind(this.template.bezelPlayStatus, 'animationend', () => {
        this.template.bezel.classList.remove('one-player--bezel-show-play')
      })
    }
    if (this.player.opt.canFull) {
      bind(this.template.bezel, 'dblclick', evt => {
        this.player.toggleFullScreen()
      })
    }
  }

  _initLoading () {
    this.player.on(START_WAITING_EVENTS, evt => {
      this.player.log('showLoading', evt.type)
      this.showLoading()
    })
    this.player.on(END_WAITING_EVENTS, evt => {
      this.player.log('hideLoading', evt.type)
      this.hideLoading()
    })
  }

  _initTimeout () {
    this.player.on(EVENTS.TIMEOUT, evt => {
      this.player.log('showTimeout', evt.type)
      this._showTimeout()
    })
    this.player.on(EVENTS.STOP_TIMEOUT, evt => {
      this.player.log('hideTimeout', evt.type)
      this._hideTimeout()
    })
  }

  _initErrorTip () {
    this.player.on(EVENTS.ERROR_TIP, evt => {
      this.player.log('showErrorTip', evt.type)
      const detail = evt.detail
      const detailType = typeof detail

      if (Array.isArray(detail)) {
        this.showMessage(...detail)
      } else if (detailType === 'string') {
        this.showMessage(detail)
      } else if (detailType === 'object') {
        this.showMessage(detail.message, detail)
      }
    })

    bind(this.template.messageHandleButton, 'click', e => {
      this.__messageHandle && this.__messageHandle(e)
    })
  }

  _showTimeout () {
    let tip
    let opts
    if (!this.player.hasQuality() || this.player.isLastQuality()) {
      tip = this.player.opt.text.slowNetworkTip2
    } else {
      tip = this.player.opt.text.slowNetworkTip
      opts = {
        action: this.player.opt.text.slowNetworkButtonTip,
        handle: this._switchQuality
      }
    }
    this.showLoading(true)
    this.showMessage(tip, opts)
  }

  _hideTimeout () {
    this.hideLoading()
    this.clearMessage()
  }

  _switchQuality () {
    const quality = this.player.opt.quality
    if (!quality || !quality.length) {
      return
    }
    this.player.reduceQuality()
    this._hideTimeout()
  }

  clearMessage () {
    this.template.bezel.classList.remove('one-player--bezel-show-message')
  }

  showMessage (...args) {
    this.player.log('showMessage', args)
    this.updateMessageTip(...args)
    this.template.bezel.classList.add('one-player--bezel-show-message')
  }

  updateMessageTip (tip = '', opt = {}) {
    this.template.messageTip.textContent = tip
    this.template.messageHandleButton.textContent = opt.action || ''
    this.__messageHandle = opt.handle
  }

  hideLoading () {
    this.template.bezel.classList.remove('one-player--bezel-show-loading')
    if (this.showLoadingTimer) {
      clearTimeout(this.showLoadingTimer)
    }
  }

  showLoading (force) {
    if (this.template.bezel.classList.contains('one-player--bezel-show-loading')) return
    if (this.showLoadingTimer) {
      clearTimeout(this.showLoadingTimer)
    }
    if (force || !this.player.opt.showLoadingDelay) {
      this.template.bezel.classList.add('one-player--bezel-show-loading')
      return
    }
    this.showLoadingTimer = setTimeout(() => {
      this.template.bezel.classList.add('one-player--bezel-show-loading')
    }, this.player.opt.showLoadingDelay * 1000)
  }

  clear () {
    this.template.bezel.className = 'one-player--bezel'
  }
}
