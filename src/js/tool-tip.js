import EVENTS from './events'
import { AutoBindMethod } from './base'
export default class ToolTip extends AutoBindMethod {
  constructor (player) {
    super()
    this.player = player
    this.template = this.player.template
    this._initListener()
  }

  _initListener () {
    this.player.on(EVENTS.USER_ACTIVE_CHANGE, (evt) => {
      if (!evt.detail.active) {
        this.hide()
      }
    })
    this.player.on(EVENTS.FULLSCREEN_CHANGE, () => {
      this.hide()
    })
  }

  show (text, el, topOffset) {
    if (!el.offsetParent) {
      this.hide()
      return
    }
    this.template.toolTip.textContent = text
    this.template.toolTip.style.display = 'block'
    const offset = this._computeOffset(el, topOffset)
    this.template.toolTip.style.left = offset.left + 'px'
    this.template.toolTip.style.top = offset.top + 'px'
  }

  _computeOffset (el, topOffset = 13) {
    const elReact = el.getBoundingClientRect()
    const videoReact = this.template.playerWhole.getBoundingClientRect()
    const tipWidth = this.template.toolTip.offsetWidth
    return {
      left: Math.max(tipWidth / 2, Math.min(elReact.left - videoReact.left + elReact.width / 2, videoReact.width - tipWidth / 2)),
      top: elReact.top - videoReact.top - topOffset
    }
  }

  hide () {
    this.template.toolTip.style.display = 'none'
  }
}
