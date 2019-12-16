import EVENTS from './events'
import { AutoBindMethod } from './base'
export default class Live extends AutoBindMethod {
  constructor (player) {
    super()
    this.player = player
    this.template = this.player.template
    this._init()
  }

  _init () {
    if (this.player.isPaused()) {
      this._show()
    }
    this.player.on(EVENTS.USER_ACTIVE_CHANGE, (evt) => {
      if (evt.detail.active) {
        this._show()
      } else {
        this._hide()
      }
    })
  }

  _show () {
    this.template.live.classList.add('one-player--live-show')
  }

  _hide () {
    this.template.live.classList.remove('one-player--live-show')
  }
}
