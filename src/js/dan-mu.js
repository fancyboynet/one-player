import EVENTS from './events'
import { getOffsetToParent, filterHtml, findIndex, getElementWidth, getElementHeight } from './utils'
import { AutoBindMethod } from './base'
export default class DanMu extends AutoBindMethod {
  constructor (player) {
    super()
    this.player = player
    this.template = this.player.template
    this._opt = this.player.opt.danMu
    this._visible = this._opt.visible
    this._priorityQueue = []
    this._queue = []
    this._activeQueue = []
    this._timeOutIds = []
    this._init()
  }

  _init () {
    this.player.on(EVENTS.VIDEO_SIZE_CHANGE, () => {
      this._updateActive()
    })
    this.player.on(EVENTS.READY, () => {
      this._triggerVisibleChangeEvent()
    })
    this.player.on(EVENTS.FULLSCREEN_CHANGE, () => {
      this._clearActive()
    })
  }

  _add (content, isPriority = false) {
    const index = this._selectEnoughRowIndex()
    if (index === null) {
      if (isPriority) {
        this._addPriorityQueue(content)
      } else {
        this._addQueue(content)
      }
      return
    }
    this._start(content, index)
  }

  _addPriorityQueue (content) {
    this._priorityQueue.push(content)
  }

  _readFromPriorityQueue () {
    return this._priorityQueue.shift()
  }

  _addQueue (content) {
    this._queue.push(content)
    if (this._opt.limit && (this._queue.length > this._opt.limit)) {
      this._queue.shift()
    }
  }

  _readFromQueue () {
    return this._queue.shift()
  }

  _selectEnoughRowIndex () {
    let index = null
    for (let i = 0; i < this._opt.maxRows; i++) {
      if (!this._activeQueue[i]) {
        index = i
        break
      }
    }
    return index
  }

  append (list = [], isPriority = false) {
    if (!this._visible) {
      return
    }
    if (!Array.isArray(list)) {
      list = [list]
    }
    list.forEach(v => this._add(v, isPriority))
  }

  _onArriveMinSpace (item) {
    if (!this._visible) {
      return
    }
    item.setAttribute('data-arrive-min', 1)
    const index = parseInt(item.getAttribute('data-index'), 10)
    this._activeQueue[index] = false
    this._moveNext(index)
  }

  _moveNext (index) {
    const content = this._readFromPriorityQueue() || this._readFromQueue()
    if (content) {
      this._start(content, index)
    }
  }

  _onArriveEnd (item) {
    item.parentElement.removeChild(item)
  }

  _start (content, index) {
    this._activeQueue[index] = true
    const item = document.createElement('div')
    item.setAttribute('data-index', index)
    if (this._opt.rowHeight) {
      item.style.height = `${this._opt.rowHeight}px`
    }
    if (this._opt.richText) {
      item.innerHTML = filterHtml(content, this._opt.allowTag)
    } else {
      item.textContent = content
    }
    this.template.danMu.appendChild(item)
    item.style.top = `${index * getElementHeight(item)}px`
    this._move(item)
  }

  _clearTimeOut (id) {
    const index = findIndex(this._timeOutIds, i => id === i)
    if (index === -1) {
      return
    }
    clearTimeout(id)
    this._timeOutIds.splice(index, 1)
  }

  _clearAllTimeOut () {
    this._timeOutIds.forEach(id => clearTimeout(id))
    this._timeOutIds = []
  }

  _move (item) {
    const targetLength = getElementWidth(this.template.danMu) + getElementWidth(item)
    const minSpaceLength = this._opt.initSpace + getElementWidth(item)
    const currentOffset = getOffsetToParent(item)
    const currentLength = getElementWidth(this.template.danMu) - currentOffset.left
    const remainLength = Math.max(0, targetLength - currentLength)
    const remainMinSpaceLength = Math.max(0, minSpaceLength - currentLength)
    const speed = this._computedSpeed(item)
    const targetDuration = remainLength / speed
    const minSpaceDuration = remainMinSpaceLength / speed
    const duration = `${targetDuration}s`
    const translateX = `translateX(-${targetLength}px)`
    item.setAttribute('data-speed', speed)
    item.style.transitionDuration = duration
    item.style.transform = translateX
    if (minSpaceDuration) {
      this._clearItemMinSpaceListener(item)
      item.__minSpaceListener = setTimeout(_ => this._onArriveMinSpace(item), minSpaceDuration * 1000)
      this._timeOutIds.push(item.__minSpaceListener)
    }
    if (targetDuration) {
      this._clearItemEndedListener(item)
      item.__endedListener = setTimeout(_ => this._onArriveEnd(item), targetDuration * 1000)
      this._timeOutIds.push(item.__endedListener)
    }
  }

  _clearItemMinSpaceListener (item) {
    if (item.__minSpaceListener) {
      this._clearTimeOut(item.__minSpaceListener)
    }
  }

  _clearItemEndedListener (item) {
    if (item.__endedListener) {
      this._clearTimeOut(item.__endedListener)
    }
  }

  _getPreItem (item) {
    const index = parseInt(item.getAttribute('data-index'), 10)
    const items = this.template.danMu.querySelectorAll(`[data-index="${index}"]`)
    if (!items) {
      return null
    }
    const i = findIndex(Array.prototype.slice.call(items), (el) => {
      return item === el
    })
    const pre = items[i - 1]
    if (!pre) {
      return null
    }
    return pre
  }

  _computedSpeed (item) {
    if (!this._opt.acceleration) {
      return this._opt.speed
    }
    const accelerationSpeed = this._computedAccelerationSpeed(item)
    if (!this._opt.noCover) {
      return accelerationSpeed
    }
    const preItem = this._getPreItem(item)
    if (!preItem) {
      return accelerationSpeed
    }
    const previewOffset = getOffsetToParent(preItem)
    const previewSpeed = parseFloat(preItem.getAttribute('data-speed'))
    const previewRemainLength = getElementWidth(this.template.danMu) - previewOffset.right
    const itemOffset = getOffsetToParent(item)
    const maxSpeed = itemOffset.left / (previewRemainLength / previewSpeed)
    return Math.min(accelerationSpeed, maxSpeed)
  }

  _computedAccelerationSpeed (item) {
    const itemWidth = getElementWidth(item)
    const r = itemWidth - this._opt.minWidth
    const s = this._opt.speed + Math.round(this._opt.acceleration * r)
    return s
  }

  _updateActive () {
    const items = this.template.danMu.children
    Array.from(items).forEach(item => {
      this._move(item)
    })
  }

  _clearActive () {
    const items = this.template.danMu.children
    Array.from(items).forEach(item => {
      this._clearItemMinSpaceListener(item)
      this._clearItemEndedListener(item)
    })
    this._activeQueue = []
    this.template.danMu.innerHTML = ''
  }

  _clear () {
    this._clearAllTimeOut()
    this._queue = []
    this._priorityQueue = []
    this._clearActive()
  }

  toggle () {
    if (this._visible) {
      this.hide()
      return
    }
    this.show()
  }

  isVisible () {
    return this._visible
  }

  show () {
    this._visible = true
    this._triggerVisibleChangeEvent()
  }

  hide () {
    this._visible = false
    this._clear()
    this._triggerVisibleChangeEvent()
  }

  _triggerVisibleChangeEvent () {
    this.player.emit(EVENTS.DAN_MU_VISIBLE_CHANGE, {
      visible: this._visible
    })
  }
}
