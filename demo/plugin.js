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
      name: 'mp4',
      url: 'http://clips.vorwaerts-gmbh.de/VfE_html5.mp4'
    },
    {
      name: '1080',
      url: 'https://video-dev.github.io/streams/x36xhzz/url_8/193039199_mp4_h264_aac_fhd_7.m3u8'
    },
    {
      name: '720',
      url: 'https://video-dev.github.io/streams/x36xhzz/url_0/193039199_mp4_h264_aac_hd_7.m3u8'
    },
    {
      name: '480',
      url: 'https://video-dev.github.io/streams/x36xhzz/url_6/193039199_mp4_h264_aac_hq_7.m3u8'
    },
    {
      name: '380',
      url: 'https://video-dev.github.io/streams/x36xhzz/url_4/193039199_mp4_h264_aac_7.m3u8'
    },
    {
      name: '240',
      url: 'https://video-dev.github.io/streams/x36xhzz/url_2/193039199_mp4_h264_aac_ld_7.m3u8'
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
player.load(1)
