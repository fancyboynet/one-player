import Hls from 'hls.js'
import OnePlayer from '../src/index'
import Report from './player-add-report'
OnePlayer.use(Report, {
  text: 'Report'
})
let container = document.querySelector('#player')
let player = new OnePlayer({
  debug: false,
  container: container,
  autoPlay: false,
  playsInline: true,
  muted: false,
  preload: 'none',
  canFull: true,
  live: false,
  reloadOnReplayInLiveMode: false,
  hls: {
    class: Hls,
    debug: false
  },
  showCountdown: false,
  initVolume: 0.5,
  toastDuration: 5, // s
  quality: [
    {
      name: '1080',
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
    }
  ],
  beforeQualityChange (index) {
    return window.confirm(`切换到清晰度${index}?`)
  },
  cover: 'https://img1.igg.com/999/placard/2017/02/22/045323_2167.jpg',
  coverType: 'cover',
  comment: {
    enable: true, // 是否开启
    maxLength: 20
  }
})
player.load(0)
