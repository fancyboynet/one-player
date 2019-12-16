import './player-add-report.css'
import OnePlayer from '../src/index'
export default class Report extends OnePlayer.Plugin {
  constructor (player, opt = {}) {
    super(player)
    this.opt = opt
    this.init()
  }
  init () {
    let container = this.player.template.controlBar.querySelector('.one-player--control-right')
    let item = document.createElement('div')
    item.classList.add('one-player--control-item', 'player-add-report')
    item.innerHTML = `<button>${this.opt.text}</button>`
    item.addEventListener('click', () => {
      window.alert('Reported!')
      this.player.emit('report')
    })
    container.appendChild(item)
  }
}
