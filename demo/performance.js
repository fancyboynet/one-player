import Hls from 'hls.js'
import OnePlayer from '../src/index'
let container = document.querySelector('#player')
function createPlayer (opt) {
  let player = new OnePlayer(Object.assign({
    debug: false,
    container: container,
    autoPlay: true,
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
    danMu: Object.assign(readDanMuConfig(), {
      enable: true
    }),
    comment: {
      enable: true, // 是否开启
      maxLength: 20
    }
  }, opt))
  return player
}
let player = createPlayer()

player.load(0)

setInterval(function () {
  sendDanMu(createMutipleRandomDanmu(10))
}, 1000)

function createMutipleRandomDanmu (count) {
  let list = []
  for (let i = 0; i < count; i++) {
    list.push(`<span style="color: ${createRandomColor()}">${createRandomString()}</span>`)
  }
  return list
}

function createRandomColor () {
  return `rgb(${200 + Math.round(Math.random() * 55)}, ${Math.round(Math.random() * 10)}, ${Math.round(Math.random() * 10)})`
}

function readDanMuConfig () {
  return {
    limit: 100,
    maxRows: 7,
    rowHeight: 36,
    initSpace: 120,
    speed: 80,
    topSpace: 10,
    minWidth: 10,
    acceleration: 0.1,
    noCover: true
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

// const memory = document.querySelector('#memory')
// function detectMemory () {
//   memory.textContent = `${window.performance.memory.usedJSHeapSize} / ${window.performance.memory.totalJSHeapSize}`
//   window.requestAnimationFrame(detectMemory)
// }
// if (window.performance && window.performance.memory) {
//   detectMemory()
// }
