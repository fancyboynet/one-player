import device from './device'
const prefix = 'IGGFE_'
const types = [
  'SOURCE_CHANGE',
  'RELOAD',
  'AUTO_RECOVER',
  'BEFORE_AUTO_RELOAD',
  'AUTO_RELOAD',
  'COMMENT',
  'LOAD',
  'READY',
  'BROWSER_AUTO_PLAY_BLOCKED',
  'DAN_MU_VISIBLE_CHANGE',
  'VIDEO_SIZE_CHANGE',
  'EVENT',
  'ERROR',
  'ERROR_TIP',
  'LOG',
  'USER_ACTIVE_CHANGE',
  'DRAG_END',
  'QUALITY_CHANGE',
  'FULLSCREEN_CHANGE',
  'VOLUME_CHANGE',
  'TIMEOUT',
  'STOP_TIMEOUT',
  'CLICK_VIDEO',
  'BEFORE_DESTROY',
  'DESTROY'
]
const EVENTS = {}
types.forEach(type => {
  EVENTS[type] = `${prefix}${type}`
})

export default EVENTS
export const FULLSCREEN_EVENTS = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'msfullscreenchange']
export const START_WAITING_EVENTS = ['loadstart', 'waiting']
export const END_WAITING_EVENTS = ['loadeddata', 'pause', 'canplay', 'canplaythrough', 'ended']
if (device.isEdge) { // Edge waiting后不会触发canplay或者canplaythrough
  END_WAITING_EVENTS.push('progress')
}
