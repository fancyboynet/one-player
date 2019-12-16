import { bind, hideEl, showEl, copy, unbind } from './utils'
import { AutoBindMethod } from './base'
export default class ContextMenu extends AutoBindMethod {
  constructor (player) {
    super()
    this.player = player
    this.template = this.player.template
    this._init()
  }

  _init () {
    this._initReset()
    this._initVersion()
    this._initStats()
    this._initCopyUrl()
    this._initPip()
    bind(this.template.playerWhole, 'contextmenu', this._onContextMenuListener, true)
    bind(this.template.contextMenu, ['blur', 'click'], this._onBlurListener)
  }

  _initReset () {
    if (!this.player.opt.contextMenu.resetAble) {
      return
    }
    showEl(this.template.contextMenuReset)
    bind(this.template.contextMenuReset, 'click', () => {
      unbind(this.template.playerWhole, 'contextmenu', this._onContextMenuListener, true)
    })
  }

  _onBlurListener () {
    this._hide()
  }

  _initVersion () {
    this.template.contextMenuVersion.textContent = `${NAME} v${VERSION}`
  }

  _onContextMenuListener (evt) {
    const offsetRect = evt.currentTarget.getBoundingClientRect()
    this._show(evt.clientX - offsetRect.left, evt.clientY - offsetRect.top)
    evt.stopPropagation()
    evt.preventDefault()
  }

  _show (x = 0, y = 0) {
    this.template.contextMenu.style.left = `${x}px`
    this.template.contextMenu.style.top = `${y}px`
    showEl(this.template.contextMenu)
    this.template.contextMenu.focus()
  }

  _hide () {
    hideEl(this.template.contextMenu)
  }

  _initStats () {
    bind(this.template.contextMenuStats, 'click', () => {
      this.player.stats.toggle()
    })
  }

  _initCopyUrl () {
    bind(this.template.contextMenuCopyUrl, 'click', () => {
      copy(this.player.opt.contextMenu.copyUrl || this.player.getCurrentUrl())
    })
  }

  _initPip () {
    if (!this.player.opt.contextMenu.pipAble) {
      return
    }
    if (!this.player.video.requestPictureInPicture) {
      return
    }
    showEl(this.template.contextMenuPip)
    bind(this.template.contextMenuPip, 'click', this._pipVideo)
  }

  async _pipVideo () {
    try {
      if (this.player.video !== document.pictureInPictureElement) {
        await this.player.video.requestPictureInPicture()
      } else {
        await document.exitPictureInPicture()
      }
    } catch (error) {
      this.player.log(`> Argh! ${error}`)
    }
  }
}
