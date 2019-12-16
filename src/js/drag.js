import { AutoBindMethod } from './base'
import { bind, unbind } from './utils'
import EVENTS from './events'

export default class Drag extends AutoBindMethod {
  constructor (el, player) {
    super()
    this.el = el
    this.initListener()
    this.player = player
  }

  initListener () {
    bind(this.el, ['mousedown', 'touchstart'], this._start)
    bind(this.el, ['click'], (evt) => {
      evt.stopPropagation()
    })
  }

  _getClientOffset (evt) {
    if (evt.clientX) {
      return [evt.clientX, evt.clientY]
    }
    if (evt.changedTouches && evt.changedTouches[0]) {
      return [evt.changedTouches[0].clientX, evt.changedTouches[0].clientY]
    }
    return []
  }

  _onDrag (evt) {
    if (!this._enable) {
      return
    }
    const offset = this._getClientOffset(evt)
    if (!this.el.offsetParent) {
      this._stop(evt)
      return
    }
    this._onDragHandler && this._onDragHandler(offset[0] - this._startX, offset[1] - this._startY)
  }

  onDragStart (fn) {
    this._onDragStartHandler = fn
  }

  onDrag (fn) {
    this._onDragHandler = fn
  }

  onDragEnd (fn) {
    this._onDragEndHandler = fn
  }

  isDragging () {
    return !!this._enable
  }

  _stop (evt) {
    const offset = this._getClientOffset(evt)
    this._enable = false
    unbind(document, 'mouseup', this._onMouseUpListener)
    unbind(document, 'mousemove', this._onDragListener)
    unbind(this.el, 'touchend', this._onMouseUpListener)
    unbind(this.el, 'touchmove', this._onDragListener)
    this._onDragEndHandler && this._onDragEndHandler(offset[0] - this._startX, offset[1] - this._startY)
    this.player.emit(EVENTS.DRAG_END)
  }

  _onDragListener (evt) {
    this._onDrag(evt)
  }

  _onMouseUpListener (evt) {
    this._stop(evt)
  }

  _start (evt) {
    const offset = this._getClientOffset(evt)
    this._startX = offset[0]
    this._startY = offset[1]
    this._enable = true
    bind(document, 'mouseup', this._onMouseUpListener)
    bind(document, 'mousemove', this._onDragListener)
    bind(this.el, 'touchend', this._onMouseUpListener)
    bind(this.el, 'touchmove', this._onDragListener)
    this._onDragStartHandler && this._onDragStartHandler(this._startX, this._startY)
  }
}
