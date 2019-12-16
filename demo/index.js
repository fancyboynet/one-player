import Hls from 'hls.js'
import OnePlayer from '../src/index'
import { PlayerStat } from './player-stat'
// const Hls = window.Hls
let container = document.querySelector('#player')
let playerStat = new PlayerStat()
playerStat.triggerPageEnter()
const VIDEO_EVENTS = [
  'abort',
  'canplay',
  'canplaythrough',
  'durationchange',
  'emptied',
  'ended',
  'error',
  'interruptbegin',
  'interruptend',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'mozaudioavailable',
  'pause',
  'play',
  'playing',
  'progress',
  'seeked',
  'seeking',
  'stalled',
  'suspend',
  'timeupdate',
  'volumechange',
  'waiting',
  'enterpictureinpicture',
  'leavepictureinpicture'
]
function createPlayer (opt) {
  let player = new OnePlayer(Object.assign({
    debug: true,
    container: container,
    autoPlay: true,
    // autoReload: 0,
    playsInline: true,
    muted: false,
    preload: 'auto',
    canFull: true,
    live: true,
    reloadOnReplayInLiveMode: true,
    togglePlayOnClickVideo: true,
    hls: {
      class: Hls,
      debug: true,
      maxBufferHole: 0.5
    },
    showCountdown: false,
    initVolume: 0.5,
    toastDuration: 5, // s
    showLoadingDelay: 0, // 延时多少秒显示loading
    quality: [
      {
        name: '1080',
        url: 'https://video-dev.github.io/streams/x36xhzz/url_8/193039199_mp4_h264_aac_fhd_7.m3u8'
        // url: 'https://s3.cn-north-1.amazonaws.com.cn/wlmedia/qa/live/WeLive-DEV_39070_1418_306254_sd/vod/play_1553577829258.m3u8'
        // url: 'http://10.0.2.63/m3u8/live_rel_WeLive-DEV_39070_1397_305444_fhd.m3u8'
        // url: 'https://s3.cn-north-1.amazonaws.com.cn/wlmedia/qa/clips/20190313/WeLive-DEV_35820_280_305612/20190313_10_52_28_WeLive-DEV_35820_280_305612_d77975760024425ca5ffbd275c0248a9_pre.mp4'
        // url: 'https://s3.cn-north-1.amazonaws.com.cn/wlmedia/qa/clips/20180926/WeLive-DEV_35790_382_301312/20180926_13_12_14_WeLive-DEV_35790_382_301312_4df5ba0c1ead4b81b71eb83e56620dde_pre.mp4'
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
    contextMenu: {
      copyUrl: '',
      pipAble: true, // 是否显示“画中画”模式
      resetAble: true // 是否显示还原右键菜单
    },
    danMu: Object.assign(readDanMuConfig(), {
      enable: true,
      richText: true
    }),
    comment: {
      enable: true, // 是否开启
      maxLength: 20
    }
  }, opt))
  player.on(OnePlayer.EVENTS.LOG, (evt) => {
    let textarea = document.querySelector('#log')
    textarea.value = textarea.value + evt.detail.info + '\n'
    textarea.scrollTop = textarea.scrollHeight
  })
  player.on(OnePlayer.EVENTS.EVENT, (evt) => {
    // let textarea = document.querySelector('#events')
    // textarea.value = textarea.value + evt.detail.type + '\n'
    // textarea.scrollTop = textarea.scrollHeight
  })
  player.on(OnePlayer.EVENTS.ERROR, (evt) => {
    let textarea = document.querySelector('#errors')
    textarea.value = textarea.value + evt.detail.message + '\n'
    textarea.scrollTop = textarea.scrollHeight
  })
  player.on(OnePlayer.EVENTS.DAN_MU_VISIBLE_CHANGE, (evt) => {
    document.querySelector('#dan-mu-toggle-button').textContent = evt.detail.visible ? '隐藏弹幕' : '显示弹幕'
  })
  player.on(OnePlayer.EVENTS.VIDEO_SIZE_CHANGE, (evt) => {
    container.style.height = evt.detail.width * 9 / 16 + 'px'
  })
  player.on(OnePlayer.EVENTS.COMMENT, (evt) => {
    player.toast('评论内容：' + evt.detail.content)
    player.clearComment()
  })
  player.on(VIDEO_EVENTS, (evt) => {
    if (evt.type === 'timeupdate') {
      return
    }
    let textarea = document.querySelector('#events')
    textarea.value = textarea.value + evt.type + '\n'
    textarea.scrollTop = textarea.scrollHeight
  })
  return player
}
let player = createPlayer()
player.on(OnePlayer.EVENTS.LOAD, () => {
  playerStat.initPlayer(player)
})

player.load(0)
// player.load('https://s3.cn-north-1.amazonaws.com.cn/wlmedia/qa/live/WeLive-DEV_35790_399_301384/vod/play_1538113523421.m3u8')
// player.load('https://dhi9hq3pw4iz.cloudfront.net/m3u8/live_ssl_WeLive-Ext-OL_11534775_63_411567.m3u8')

document.querySelector('#version').textContent = OnePlayer.VERSION
document.querySelector('#hls-version').textContent = Hls.version
document.querySelector('#play-button').addEventListener('click', function () {
  player.play()
})
document.querySelector('#pause-button').addEventListener('click', function () {
  player.pause()
})
document.querySelector('#is-support-hls-button').addEventListener('click', function () {
  window.alert(Hls.isSupported())
})
document.querySelector('#load-mp4-button').addEventListener('click', function () {
  player.switch('http://clips.vorwaerts-gmbh.de/VfE_html5.mp4')
})
document.querySelector('#load-m3u8-button').addEventListener('click', function () {
  player.switch('http://dm8ibvx3p1j22.cloudfront.net/stream/live/WeLive-Ext-OL_13197510_9_159540/vod/play_1526793041741e.m3u8')
})
document.querySelector('#load-mutiple-m3u8-button').addEventListener('click', function () {
  player.switch('https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8')
})
document.querySelector('#load-reduce-quality-button').addEventListener('click', function () {
  player.reduceQuality()
})
document.querySelector('#load-select-quality-button').addEventListener('click', function () {
  player.load(parseInt(document.querySelector('#load-select-quality-input').value, 10))
})
document.querySelector('#destroy-button').addEventListener('click', function () {
  player.destroy()
})
document.querySelector('#is-last-quality-button').addEventListener('click', function () {
  window.alert(player.isLastQuality())
})
document.querySelector('#load-custom-button').addEventListener('click', function () {
  player.destroy()
  player = createPlayer()
  player.load(document.querySelector('#load-custom-input').value)
})
document.querySelector('#load-custom-live-button').addEventListener('click', function () {
  player.destroy()
  player = createPlayer({
    live: true
  })
  player.load(document.querySelector('#load-custom-input').value)
})
document.querySelector('#hls-recover-media-error-button').addEventListener('click', function () {
  player._hls.recoverMediaError()
})
document.querySelector('#dan-mu-button').addEventListener('click', function () {
  let value = document.querySelector('#dan-mu-input').value
  if (!value.length) {
    window.alert('不能为空')
    return
  }
  sendDanMu(`<div style="color: ${createRandomColor()}">${filterContent(value)}</div>`)
})
document.querySelector('#dan-mu-priority-button').addEventListener('click', function () {
  let value = document.querySelector('#dan-mu-input').value
  if (!value.length) {
    window.alert('不能为空')
    return
  }
  sendDanMu(`<div style="color: ${createRandomColor()}">${filterContent(value)}</div>`, true)
})
document.querySelector('#dan-mu-toggle-button').addEventListener('click', function () {
  player.toggleDanMu()
})
document.querySelector('#dan-mu-xss').addEventListener('click', function () {
  sendDanMu(`
45454545
<div id="div" class="aaa" style="width:100px;" data-aaa disabled>
1111
  <p>
  343434
  <span id="daf" class="asdfasf" style="height:30px;">123123213</span>
</p>
  <a href="_" onclick="alert('555');">555</a>
</div>
<a href="_" onclick="alert('link');">link</a>
<input type="text" placeholder="input" />
<img src="_" onclick="alert(1);">
<script type="text/javascript">javascript:window.alert(2)</script>
`, true)
})
document.querySelector('#dan-mu-auto-button').addEventListener('click', function () {
  setInterval(function () {
    sendDanMu(createMutipleRandomDanmu(10))
  }, 1000)
})
document.querySelector('#dan-mu-multiple-button').addEventListener('click', function () {
  sendDanMu([
    createRandomString(),
    `<div style="color: ${createRandomColor()}">${createRandomString()}</div>`,
    `<div style="color: ${createRandomColor()}">${createRandomString()}</div>`,
    `<div style="color: ${createRandomColor()}">${createRandomString()}</div>`,
    createRandomString(),
    `<div style="color: ${createRandomColor()}">${createRandomString()}</div>`,
    createRandomString(),
    `<div style="color: ${createRandomColor()}">${createRandomString()}</div>`,
    `<div style="color: ${createRandomColor()}">${createRandomString()}</div>`,
    `<div style="color: ${createRandomColor()}">${createRandomString()}</div>`
  ])
})

function createMutipleRandomDanmu (count) {
  let list = []
  for (let i = 0; i < count; i++) {
    list.push(`<div style="color: ${createRandomColor()}">${createRandomString()}</div>`)
  }
  return list
}

function createRandomColor () {
  return `rgb(${200 + Math.round(Math.random() * 55)}, ${Math.round(Math.random() * 10)}, ${Math.round(Math.random() * 10)})`
}

function readDanMuConfig () {
  return {
    limit: parseInt(document.querySelector('#dan-mu-limit').value, 10),
    maxRows: parseInt(document.querySelector('#dan-mu-maxRows').value, 10),
    rowHeight: parseInt(document.querySelector('#dan-mu-rowHeight').value, 10),
    initSpace: parseInt(document.querySelector('#dan-mu-initSpace').value, 10),
    speed: parseInt(document.querySelector('#dan-mu-speed').value, 10),
    topSpace: parseInt(document.querySelector('#dan-mu-topSpace').value, 10),
    minWidth: parseInt(document.querySelector('#dan-mu-minWidth').value, 10),
    acceleration: parseFloat(document.querySelector('#dan-mu-acceleration').value),
    noCover: parseInt(document.querySelector('#dan-mu-noCover').value, 10)
  }
}
function createRandomString () {
  let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let lenth = Math.ceil(Math.random() * 50)
  let arr = []
  for (let i = 0; i < lenth; i++) {
    arr.push(str.charAt(Math.floor(Math.random() * str.length)))
  }
  return arr.join('')
}

function sendDanMu (list, isPriority = false) {
  player.configDanMu(readDanMuConfig())
  player.appendDanMu(list, isPriority)
}
player.configDanMu(readDanMuConfig())

function filterContent (content) {
  return content.replace(/<|>/ig, ($0) => {
    switch ($0) {
      case '<' :
        return '&lt;'
      case '>' :
        return '&gt;'
    }
  })
}

document.querySelector('#comment-show-button').addEventListener('click', function () {
  player.showComment()
})
document.querySelector('#comment-hide-button').addEventListener('click', function () {
  player.hideComment()
})
document.querySelector('#comment-clear-button').addEventListener('click', function () {
  player.clearComment()
})
document.querySelector('#toast-button').addEventListener('click', function () {
  player.toast(createRandomString())
})
document.querySelector('#comment-input-button').addEventListener('click', function () {
  let value = document.querySelector('#comment-input').value
  if (!value.length) {
    window.alert('不能为空')
    return
  }
  player.setComment(value)
})
const memory = document.querySelector('#memory')
function detectMemory () {
  memory.textContent = `${window.performance.memory.usedJSHeapSize.toLocaleString()} / ${window.performance.memory.totalJSHeapSize.toLocaleString()}`
}
if (window.performance && window.performance.memory) {
  setInterval(detectMemory, 500)
}
