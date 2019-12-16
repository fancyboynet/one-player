import { AutoBindMethod } from './base'
import { bind } from './utils'
import EVENTS from './events'

export default class Quality extends AutoBindMethod {
  constructor (player) {
    super()
    this.player = player
    this.template = this.player.template
    this.opt = this.player.opt

    this._init()
  }

  _init () {
    if (!this.player.hasQuality()) {
      return
    }
    this._activeIndex = -1
    bind(this.template.quality, 'mouseenter', this._showList)
    bind(this.template.quality, 'mouseleave', this._hideList)
    bind(this.template.qualityActive, 'click', this._toggleList)
    bind(this.template.qualityList, 'click', e => {
      const target = e.target
      if (target.tagName.toLowerCase() !== 'li') {
        return
      }
      if (target.classList.contains('one-player--quality-list-active')) {
        return
      }
      this.change(parseInt(target.getAttribute('data-index'), 10))
    })

    // 切换源保持播放进度
    if (!this.opt.live && this.opt.keepTimeOnQualityChange) {
      bind(this.player.video, 'loadedmetadata', this._setTimeOnChange)
    }
  }

  _updateListColor (index) {
    Array.prototype.forEach.call(
      this.template.qualityList.querySelectorAll('li'),
      (el, i) => {
        if (i === index) {
          el.classList.add('one-player--quality-list-active')
        } else {
          el.classList.remove('one-player--quality-list-active')
        }
      }
    )
  }

  _isNoActiveIndex () {
    return this._activeIndex === -1
  }

  change (index) {
    if (!this.player.hasQuality()) {
      return
    }
    const quality = this.opt.quality
    index = Math.min(index, quality.length - 1)
    if (index === this._activeIndex) {
      return
    }
    if (
      this.opt.beforeQualityChange &&
      !this._isNoActiveIndex() &&
      !this.opt.beforeQualityChange(index)
    ) {
      return
    }

    this._currentTime = Math.floor(this.player.video.currentTime)

    this._updateListColor(index)
    const target = quality[index]
    this.template.qualityActive.textContent = target.name
    this.player.loadUrl(target.url)
    if (!this._isNoActiveIndex()) {
      this.player.emit(EVENTS.QUALITY_CHANGE, {
        index: index
      })
    }
    this._activeIndex = index
  }

  _setTimeOnChange () {
    if (!this._currentTime) return

    this.player.setTime(this._currentTime)
  }

  _showList () {
    this.template.quality.classList.add('one-player--quality-show')
  }

  _hideList () {
    this.template.quality.classList.remove('one-player--quality-show')
  }

  _toggleList () {
    this.template.quality.classList.toggle('one-player--quality-show')
  }

  reduce () {
    this.change(this._activeIndex + 1)
  }

  isLast () {
    if (!this.player.hasQuality()) {
      return false
    }
    return this._activeIndex === this.opt.quality.length - 1
  }
}
