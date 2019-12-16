import { AutoBindMethod } from './base'
export default class Cover extends AutoBindMethod {
  constructor (player) {
    super()
    this.player = player
    this.template = this.player.template
    this._init()
  }

  _init () {
    this.player.on('playing', () => {
      this.template.cover.style.display = 'none'
    })
  }
}
