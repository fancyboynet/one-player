import icon from './icon'
import { formatTime, isFullScreen, bind, hideEl, showEl } from './utils'
import EVENTS from './events'
import Drag from './drag'
import device from './device'
import SvgAnimation from './svg'
import { AutoBindMethod } from './base'

export default class ControlBar extends AutoBindMethod {
  constructor (player) {
    super()
    this.player = player
    this.template = this.player.template
    this._init()
  }

  _init () {
    this._initBasic()
    this._initVolumeAnimation()
    this._initVolume()
    this._initFull()
    this._initPlay()
    this._initTime()
    this._initCountdown()
    this._initProgress()
    this._initFresh()
    this._initDanMu()
    this._initComment()
  }

  _initFresh () {
    bind(this.template.freshButton, 'click', () => {
      this.player.reload()
    })
    if (!device.isMobile) {
      bind(this.template.freshButton, ['mouseenter', 'click'], () => {
        this.player.toolTip.show(this.player.opt.text.freshButtonTip, this.template.freshButton.parentElement)
      })
      bind(this.template.freshButton, 'mouseleave', this._hideToolTip)
    }
  }

  _initBasic () {
    if (this.player.isPaused()) {
      this._showControlBar()
    }
    this.player.on('loadedmetadata', () => {
      this._updateVolumeButton()
      this._updateVolumeProgress()
    })
    this.player.on(EVENTS.USER_ACTIVE_CHANGE, (evt) => {
      if (evt.detail.active) {
        this._showControlBar()
      } else {
        this._hideControlBar()
      }
    })
    this._isMouseEnter = false
    bind(this.template.controlBar, 'mouseenter', (evt) => {
      this._isMouseEnter = true
    })
    bind(this.template.controlBar, 'mouseleave', (evt) => {
      this._isMouseEnter = false
    })
  }

  _initProgress () {
    if (this.player.opt.live) {
      return
    }
    this._progressDrag = new Drag(this.template.progressDrag, this.player)
    this.player.on('timeupdate', () => {
      if (!this._progressDrag.isDragging()) {
        this._updateProgressPlay()
      }
    })
    this.player.on('progress', this._updateProgressLoaded)
    bind(this.template.progress, 'mousemove', this._updateProgressHover)
    bind(this.template.progress, 'mouseleave', () => {
      this._hideProgressHover()
      this._hideToolTip()
    })
    if (!device.isMobile) {
      bind(this.template.progress, 'mouseenter', () => {
        this._isMouseEnterProgress = true
        this._showProgressDrag()
      })
      bind(this.template.progress, 'mouseleave', () => {
        this._isMouseEnterProgress = false
        this._hideProgressDrag()
      })
    }
    bind(this.template.progress, 'click', (evt) => {
      const maxWidth = this.template.progress.offsetWidth
      this._seek(evt.offsetX / maxWidth)
    })
    this._progressDrag.onDragStart(() => {
      this._adjustProgressStartWidth = this.template.progressPlay.offsetWidth
    })
    this._progressDrag.onDrag((offsetX, offsetY) => {
      this._adjustProgress(offsetX)
      this._showTimeToolTip(offsetX)
    })
    this._progressDrag.onDragEnd((offsetX, offsetY) => {
      this._adjustProgress(offsetX, true)
      this._hideProgressDrag()
      this._hideToolTip()
    })
  }

  _showTimeToolTip (offsetX) {
    const duration = this.player.video.duration
    if (!duration) {
      return
    }
    const percent = this._computeProgressPercent(offsetX)
    this.player.toolTip.show(formatTime(duration * percent), this.template.progressDrag, 0)
  }

  _computeProgressPercent (offsetX) {
    const maxWidth = this.template.progress.offsetWidth
    const targetWidth = Math.min(Math.max(0, this._adjustProgressStartWidth + offsetX), maxWidth)
    return targetWidth / maxWidth
  }

  _hideToolTip () {
    this.player.toolTip.hide()
  }

  _showControlBar () {
    this.template.controlBar.classList.add('one-player--control-bar-show')
  }

  showControlBar () {
    this._showControlBar()
  }

  _hideControlBar () {
    this.template.controlBar.classList.remove('one-player--control-bar-show')
    this.template.video.removeAttribute('controls')
  }

  hideControlBar () {
    this._hideControlBar()
  }

  _adjustProgress (offsetX, isSeek) {
    const percent = this._computeProgressPercent(offsetX)
    this._updateProgressPlay(percent)
    if (isSeek) {
      this._seek(percent)
    }
  }

  _showProgressDrag () {
    this.template.progress.classList.add('one-player--progress-show')
  }

  _hideProgressDrag () {
    if (this._progressDrag.isDragging() || this._isMouseEnterProgress) {
      return
    }
    this.template.progress.classList.remove('one-player--progress-show')
  }

  _initTime () {
    if (this.player.opt.live || this.player.opt.showCountdown) {
      return
    }
    this.player.on('loadedmetadata', (evt) => {
      this._updateCurrentTime(evt)
      this._updateTotalTime()
    })
    this.player.on('timeupdate', this._updateCurrentTime)
  }

  _initCountdown () {
    if (this.player.opt.live || !this.player.opt.showCountdown) {
      return
    }
    this.template.time.style.display = 'none'
    this.player.on('timeupdate', this._updateCountdown)
  }

  _updateCountdown () {
    this.template.countdown.innerHTML = formatTime(this.player.video.duration - this.player.video.currentTime)
  }

  _showPause () {
    this._playAnimation = new SvgAnimation('M2 1 L9 5 C 9 5 9 5 9 5 L9 13 C9 13 9 13 9 13 L2 17 M9 5 L16 9 C16 9 16 9 16 9 L16 9 C16 9 16 9 16 9 L9 13', 'M3 1 L6 1 C 6.4 1 7 1.6 7 2 L7 16 C7 16.4 6.4 16.6 6 17 L3 17 M12 1 L15 1 C15.4 1 16 1.6 16 2 L16 16 C16 16.4 15.4 17 15 17 L12 17', this.template.playButton.querySelector('path'))
    this._playAnimation.update()
  }

  _showPlay () {
    this._playAnimation = new SvgAnimation('M3 1 L6 1 C 6.4 1 7 1.6 7 2 L7 16 C7 16.4 6.4 16.6 6 17 L3 17 M12 1 L15 1 C15.4 1 16 1.6 16 2 L16 16 C16 16.4 15.4 17 15 17 L12 17', 'M2 1 L9 5 C 9 5 9 5 9 5 L9 13 C9 13 9 13 9 13 L2 17 M9 5 L16 9 C16 9 16 9 16 9 L16 9 C16 9 16 9 16 9 L9 13', this.template.playButton.querySelector('path'))
    this._playAnimation.update()
  }

  _initPlay () {
    this.player.on('play', this._showPause)
    this.player.on('pause', this._showPlay)
    bind(this.template.playButton, 'click', () => {
      this.player.toggle()
    })
    if (!device.isMobile) {
      bind(this.template.playButton, ['mouseenter', 'click'], () => {
        this.player.toolTip.show(this.player.isPaused() ? this.player.opt.text.playButtonTip : this.player.opt.text.pauseButtonTip, this.template.playButton.parentElement)
      })
      bind(this.template.playButton, 'mouseleave', this._hideToolTip)
    }
  }

  _initFull () {
    if (!this.player.opt.canFull) {
      return
    }
    this.player.on(EVENTS.FULLSCREEN_CHANGE, (evt) => {
      this.template.fullButton.innerHTML = evt.detail.fullScreen ? icon.cancelFull : icon.full
      if (evt.detail.fullScreen) {
        this._isMouseEnter = false
      }
    })
    bind(this.template.fullButton, 'click', () => {
      this.player.toggleFullScreen()
    })
    if (!device.isMobile) {
      bind(this.template.fullButton, ['mouseenter', 'click'], () => {
        this.player.toolTip.show(isFullScreen() ? this.player.opt.text.cancelFullButtonTip : this.player.opt.text.fullButtonTip, this.template.fullButton.parentElement)
      })
      bind(this.template.fullButton, 'mouseleave', this._hideToolTip)
    }
  }

  _initDanMu () {
    if (!this.player.opt.danMu.enable) {
      return
    }
    this.template.danMuButton.innerHTML = icon.danMu
    this.player.on(EVENTS.DAN_MU_VISIBLE_CHANGE, (evt) => {
      if (evt.detail.visible) {
        this._danmuLineAnimation = new SvgAnimation('m6.20732,0.315l12.64368,17.694c0.48012,0.57515 1.09929,0.73742 1.658,0.262c0.48012,-0.32762 0.6989,-1.01162 0.262,-1.649l-12.673,-17.65c-0.37484,-0.43556 -0.84533,-0.58696 -1.47565,-0.19229c-0.63032,0.39466 -0.81804,0.84686 -0.38335,1.53529', 'M6.20732,0.315L6.20732,0.315C6.20732,0.315 6.20732,0.315 7.1685,-0.3565C7.1685,-0.3565 7.1685,-0.3565 8.098,-1.028L8.098,-1.028 C8.098,-1.028 8.098,-1.028 7.1685,-0.3565C7.1685,-0.3565 7.1685,-0.3565 6.20732,0.315', this.template.danMuButton.querySelector('.danmu-animation-line'))
        this._danmuLineAnimation.update()
        this.template.danMuButton.querySelector('.danmu-animation-mover').setAttribute('transform', 'rotate(-35.42460250854492,12.477108955383303,10.993218421936033) translate(0, 0)')
      } else {
        this._danmuLineAnimation = new SvgAnimation('M6.20732,0.315L6.20732,0.315C6.20732,0.315 6.20732,0.315 7.1685,-0.3565C7.1685,-0.3565 7.1685,-0.3565 8.098,-1.028L8.098,-1.028 C8.098,-1.028 8.098,-1.028 7.1685,-0.3565C7.1685,-0.3565 7.1685,-0.3565 6.20732,0.315', 'm6.20732,0.315l12.64368,17.694c0.48012,0.57515 1.09929,0.73742 1.658,0.262c0.48012,-0.32762 0.6989,-1.01162 0.262,-1.649l-12.673,-17.65c-0.37484,-0.43556 -0.84533,-0.58696 -1.47565,-0.19229c-0.63032,0.39466 -0.81804,0.84686 -0.38335,1.53529', this.template.danMuButton.querySelector('.danmu-animation-line'))
        this._danmuLineAnimation.update()
        this.template.danMuButton.querySelector('.danmu-animation-mover').setAttribute('transform', 'rotate(-35.42460250854492,12.477108955383303,10.993218421936033) translate(0, 30)')
      }
    })
    bind(this.template.danMuButton, 'click', () => {
      this.player.toggleDanMu()
    })
    if (!device.isMobile) {
      bind(this.template.danMuButton, ['mouseenter', 'click'], () => {
        this.player.toolTip.show(this.player.isDanMuVisible() ? this.player.opt.text.disableDanMuButtonTip : this.player.opt.text.enableDanMuButtonTip, this.template.danMuButton.parentElement)
      })
      bind(this.template.danMuButton, 'mouseleave', this._hideToolTip)
    }
  }

  toggleComment (isShow) {
    if (!this.player.opt.comment.enable) {
      return
    }
    if (isShow) {
      showEl(this.template.comment)
      return
    }
    hideEl(this.template.comment)
  }

  clearComment () {
    this.template.commentInput.value = ''
    this._triggerCommentChange()
  }

  setComment (v) {
    this.template.commentInput.value = v
    this._triggerCommentChange()
  }

  _initComment () {
    if (!this.player.opt.comment.enable) {
      return
    }
    bind(this.template.commentInput, 'input', this._triggerCommentChange)
    bind(this.template.commentInput, 'keyup', (evt) => {
      if (evt.keyCode === 13) {
        this._triggerComment()
      }
    })
    bind(this.template.commentButton, 'click', this._triggerComment)
  }

  _triggerComment () {
    this.player.emit(EVENTS.COMMENT, {
      content: this._getCommentContent()
    })
  }

  _triggerCommentChange () {
    this._updateCommentStyle()
  }

  _getCommentContent () {
    if (!this.player.opt.comment.enable) {
      return ''
    }
    return this.template.commentInput.value
  }

  _updateCommentStyle () {
    const content = this._getCommentContent()
    if (content.length > 0) {
      this.template.commentButton.removeAttribute('disabled')
      return
    }
    this.template.commentButton.setAttribute('disabled', 'disabled')
  }

  _initVolume () {
    this.player.on(EVENTS.BROWSER_AUTO_PLAY_BLOCKED, this._showOpenVolumeTip)
    this.player.on(EVENTS.VOLUME_CHANGE, () => {
      this._updateVolumeProgress()
      this._updateVolumeButton()
    })
    bind(this.template.volumeButton, 'click', () => {
      this.player.toggleMute()
    })
    bind(this.template.volumeProgress, 'click', (evt) => {
      const maxWidth = this.template.volumeProgress.offsetWidth
      this._setVolume(evt.offsetX / maxWidth)
    })
    this._volumnDrag = new Drag(this.template.volumeProgressDrag, this.player)
    this._volumnDrag.onDragStart(() => {
      this._adjustVolumeStartWidth = this.template.volumeProgressNow.offsetWidth
    })
    this._volumnDrag.onDrag((offsetX, offsetY) => {
      this._adjustVolume(offsetX)
    })
    this._volumnDrag.onDragEnd(() => {
      this._hideVolume()
    })
    if (!device.isMobile) {
      bind(this.template.volume, ['mouseenter', 'click'], this._showVolume)
      bind(this.template.volume, 'mouseenter', () => {
        this._isMouseEnterVolume = true
      })
      bind(this.template.volume, 'mouseleave', () => {
        this._isMouseEnterVolume = false
        this._hideVolume()
      })
    }
  }

  _showOpenVolumeTip () {
    this.player.toolTip.show(this.player.opt.text.mutedTip, this.template.volumeButton.parentElement)
  }

  _showVolume () {
    this.template.volume.classList.add('one-player--volume-show')
  }

  _hideVolume () {
    if (this._isMouseEnterVolume || this._volumnDrag.isDragging()) {
      return
    }
    this.template.volume.classList.remove('one-player--volume-show')
  }

  _seek (percent) {
    if (!this.player.video.duration) {
      return
    }
    this.player.video.currentTime = this.player.video.duration * percent
    this._updateProgressPlay()
  }

  _hideProgressHover () {
    this.template.progressHover.style.width = '0'
  }

  _updateProgressHover (evt) {
    const duration = this.player.video.duration
    if (!duration) {
      return
    }
    const offsetX = evt.clientX - this.template.progress.getBoundingClientRect().left
    let percent = offsetX / this.template.progress.offsetWidth
    percent = Math.max(0, Math.min(100, percent))
    this.template.progressHover.style.width = `${percent * 100}%`
    this.player.toolTip.show(formatTime(duration * percent), this.template.progressHover.querySelector('i'), 9)
  }

  _updateProgressLoaded () {
    const duration = this.player.video.duration
    const timeRanges = this.player.video.buffered
    if (!timeRanges.length || !duration) {
      return
    }
    const color = 'rgba(255, 255, 255, .3)'
    const background = ['transparent 0%']
    let start
    let end
    for (let i = 0; i < timeRanges.length; i++) {
      start = Math.round(timeRanges.start(i) / duration * 100)
      end = Math.round(timeRanges.end(i) / duration * 100)
      if (end > start) {
        background.push(`transparent ${start}%, ${color} ${start}%, ${color} ${end}%, transparent ${end}%`)
      }
    }
    background.push('transparent 100%')
    this.template.progressLoaded.style.background = `linear-gradient(to right, ${background})`
  }

  _updateProgressPlay (percent) {
    const duration = this.player.video.duration
    if (!duration) {
      return
    }
    percent = percent || Math.min(1, this.player.video.currentTime / duration)
    this.template.progressPlay.style.width = `${Math.round(percent * 100)}%`
  }

  _updateCurrentTime (e) {
    const eventType = e && e.type ? e.type : ''
    const duration = this.player.video.duration
    const currentTime = this.player.video.currentTime
    if (!duration || (eventType === 'loadedmetadata' && !currentTime && this._lastTime)) {
      return
    }
    this._lastTime = currentTime
    this.template.currentTime.innerHTML = formatTime(currentTime)
  }

  _updateTotalTime () {
    this.template.totalTime.innerHTML = formatTime(this.player.video.duration)
  }

  _initVolumeAnimation () {
    this._volumeOneAnimation = new SvgAnimation('m0,3l12,12c0.74561,0.64211 1.49123,0.53684 2,0c0.49123,-0.57018 0.49123,-1.44561 0,-2l-12.10406,-12.06897c-0.57718,-0.40929 -1.19068,-0.09594 -1.58015,0.38476c-0.49123,0.61053 -0.70175,1.17664 -0.03509,1.96491', '', this.template.volumeButton.querySelector('path:nth-child(1)')).setStatus('muted').reverse()
    this._volumeTwoAnimation = new SvgAnimation('M0,7C0,6.6 0.5,6 1,6 L9,14 L9,12L3,6L3,6L9,1L9,17L3,12L0,12', '', this.template.volumeButton.querySelector('path:nth-child(2)')).setStatus('muted').reverse()
    this._volumeThreeAnimation = new SvgAnimation('m11,9c0,0 0,0 0,0c0,0 0,0 0,0z', '', this.template.volumeButton.querySelector('path:nth-child(3)')).setStatus('muted').reverse()
    this._volumeFourAnimation = new SvgAnimation('M11,2C14,3.5 16,6 16,9C16,12 14,15 11,16L11,16C14,15 16,12 16,9C16,6 14,3.5 11,2', '', this.template.volumeButton.querySelector('path:nth-child(4)')).setStatus('muted').reverse()
  }

  _stopVolumeAnimation () {
    if (this._volumeOneAnimation.rID) {
      this._volumeOneAnimation.stopAni()
    }
    if (this._volumeTwoAnimation.rID) {
      this._volumeTwoAnimation.stopAni()
    }
    if (this._volumeThreeAnimation.rID) {
      this._volumeThreeAnimation.stopAni()
    }
    if (this._volumeFourAnimation.rID) {
      this._volumeFourAnimation.stopAni()
    }
  }

  _updateVolumeButton () {
    const volume = this.player.getVolume()
    if (this.player.isMuted()) {
      if (this._volumeOneAnimation.status === 'muted') return
      this._stopVolumeAnimation()
      this._volumeOneAnimation.reverse().setFin('m0,3l12,12c0.74561,0.64211 1.49123,0.53684 2,0c0.49123,-0.57018 0.49123,-1.44561 0,-2l-12.10406,-12.06897c-0.57718,-0.40929 -1.19068,-0.09594 -1.58015,0.38476c-0.49123,0.61053 -0.70175,1.17664 -0.03509,1.96491').setStatus('muted').reset().setRng()
      this._volumeTwoAnimation.reverse().setFin('M0,7C0,6.6 0.5,6 1,6 L9,14 L9,12L3,6L3,6L9,1L9,17L3,12L0,12').setStatus('muted').reset().setRng()
      this._volumeThreeAnimation.reverse().setFin('m11,9c0,0 0,0 0,0c0,0 0,0 0,0z').setStatus('muted').reset().setRng()
      this._volumeFourAnimation.reverse().setFin('M11,2C14,3.5 16,6 16,9C16,12 14,15 11,16L11,16C14,15 16,12 16,9C16,6 14,3.5 11,2').setStatus('muted').reset().setRng()
      this._volumeOneAnimation.update()
      this._volumeTwoAnimation.update()
      this._volumeThreeAnimation.update()
      this._volumeFourAnimation.update()
      return
    }
    if (volume < 0.5) {
      if (this._volumeOneAnimation.status === 'small') return
      this._stopVolumeAnimation()
      this._volumeOneAnimation.reverse().setFin('M0,3L0,3C0,3 0,3 1,2C1,2 1,2 2,1L2,1C2,1 2,1 1,2C1,2 1,2 0,3').setStatus('small').reset().setRng()
      this._volumeTwoAnimation.reverse().setFin('M0,7C0,6.6 0.5,6 1,6 L1,6 L2,6 L2,6L3,6L9,1L9,17L3,12L0,12').setStatus('small').reset().setRng()
      this._volumeThreeAnimation.reverse().setFin('m11,5c2.13542,0.76172 2.98308,2.21418 3,4c0.01692,1.78582 -1.00652,3.51372 -3,4z').setStatus('small').reset().setRng()
      this._volumeFourAnimation.reverse().setFin('M11,2C14,3.5 16,6 16,9C16,12 14,15 11,16L11,16C14,15 16,12 16,9C16,6 14,3.5 11,2').setStatus('small').reset().setRng()
      this._volumeOneAnimation.update()
      this._volumeTwoAnimation.update()
      this._volumeThreeAnimation.update()
      this._volumeFourAnimation.update()
      return
    }
    if (this._volumeOneAnimation.status === 'big') return
    this._stopVolumeAnimation()
    this._volumeOneAnimation.reverse().setFin('M0,3L0,3C0,3 0,3 1,2C1,2 1,2 2,1L2,1C2,1 2,1 1,2C1,2 1,2 0,3').setStatus('big').reset().setRng()
    this._volumeTwoAnimation.reverse().setFin('M0,7C0,6.6 0.5,6 1,6 L1,6 L2,6 L2,6L3,6L9,1L9,17L3,12L0,12').setStatus('big').reset().setRng()
    this._volumeThreeAnimation.reverse().setFin('m11,5c2.13542,0.76172 2.98308,2.21418 3,4c0.01692,1.78582 -1.00652,3.51372 -3,4z').setStatus('big').reset().setRng()
    this._volumeFourAnimation.reverse().setFin('m11,0c4.69355,1.34516 7,4.5 7,9c0,4.5 -2.46774,7.89677 -7,9l0,-2c3,-1 5,-3.35484 5,-7c0,-3.64516 -1.67741,-5.77419 -5,-7').setStatus('big').reset().setRng()
    this._volumeOneAnimation.update()
    this._volumeTwoAnimation.update()
    this._volumeThreeAnimation.update()
    this._volumeFourAnimation.update()
  }

  _updateVolumeProgress () {
    const percent = this.player.getVolume() * 100
    this.template.volumeProgressNow.style.width = `${percent}%`
  }

  _adjustVolume (offsetX) {
    const maxWidth = this.template.volumeProgress.offsetWidth
    const targetWidth = Math.min(Math.max(0, this._adjustVolumeStartWidth + offsetX), maxWidth)
    this._setVolume(targetWidth / maxWidth)
  }

  _setVolume (percent) {
    this.player.setVolume(percent)
  }

  isActive () {
    if (this._isMouseEnter) {
      return true
    }
    if (this._volumnDrag.isDragging()) {
      return true
    }
    if (this._progressDrag && this._progressDrag.isDragging()) {
      return true
    }
    return false
  }
}
