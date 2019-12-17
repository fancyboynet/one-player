import Hls from 'hls.js'
import OnePlayer from '../src/index'
import { PlayerStat } from './player-stat'
// const Hls = window.Hls
let container = document.querySelector('#player')
let playerStat = new PlayerStat()
let autoSendRandomDanMuId = null

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
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
      }
    ],
    beforeQualityChange (index) {
      return window.confirm(`切换到清晰度${index}?`)
    },
    cover: '',
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
    if (!evt.detail.width) {
      return
    }
    container.style.height = evt.detail.width * 9 / 16 + 'px'
  })
  player.on(OnePlayer.EVENTS.COMMENT, (evt) => {
    const content = evt.detail.content
    player.toast('评论内容：' + content)
    player.clearComment()
    player.appendDanMu([content], true)
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
autoSendRandomDanMu()

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
  autoSendRandomDanMu()
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
function autoSendRandomDanMu () {
  if (autoSendRandomDanMuId) {
    window.clearInterval(autoSendRandomDanMuId)
  }
  autoSendRandomDanMuId = setInterval(function () {
    sendDanMu(createMutipleRandomDanmu(10))
  }, 1000)
}

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
