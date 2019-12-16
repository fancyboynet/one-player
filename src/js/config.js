export default {
  debug: false,
  container: null,
  autoPlay: false,
  autoReload: 8, // seconds after timeout event, disabled when 0 is set
  preload: 'auto',
  muted: false,
  playsInline: true,
  canFull: true,
  live: true,
  reloadOnReplayInLiveMode: false,
  togglePlayOnClickVideo: true,
  hls: null,
  quality: null,
  beforeQualityChange: null,
  keepTimeOnQualityChange: false, // 切换清晰度后，是否保持当前播放进度，live=false时有效
  cover: null,
  coverType: 'contain', // null | contain | cover
  showLoadingDelay: 0, // 延时多少秒显示loading
  timeout: 3, // seconds
  userActionChangeTime: 3, // seconds
  showCountdown: false,
  initVolume: 1,
  toastDuration: 2, // s
  text: {
    liveTag: 'LIVE',
    fullButtonTip: 'Enter Fullscreen',
    cancelFullButtonTip: 'Exit Fullscreen',
    playButtonTip: 'Play',
    pauseButtonTip: 'Pause',
    freshButtonTip: 'Refresh',
    slowNetworkTip: 'The current network quality is poor. To continue watching without interruptions, you can switch to a lower video resolution.',
    slowNetworkTip2: 'Loading failed. Please try again later.',
    slowNetworkButtonTip: 'Switch',
    mutedTip: 'Turn up the volume and enjoy the Stream!',
    enableDanMuButtonTip: 'Show',
    disableDanMuButtonTip: 'Hide',
    commentButton: 'Send',
    commentPlaceholder: 'Hit "Enter" to comment',
    contextMenu: {
      copyUrl: 'Copy video URL',
      stats: 'Stats for nerds',
      pip: 'Picture in picture',
      reset: 'Reset the context menu'
    }
  },
  contextMenu: {
    copyUrl: '',
    pipAble: true, // 是否显示“画中画”模式
    resetAble: false // 是否显示还原右键菜单
  },
  danMu: {
    enable: false, // 是否开启
    visible: true, // 是否可见
    limit: null, // 队列限制
    maxRows: 3, // 最多行数
    rowHeight: null, // px 行高
    topSpace: 0, // px 顶部间距
    initSpace: 120, // 初始相邻弹幕间距
    speed: 80, // px/seconds 默认移动速度
    acceleration: 0, // px/px 每像素加速度
    minWidth: 11, // px 最小弹幕宽度
    noCover: false, // 是否不覆盖
    richText: false, // 是否支持富文本
    allowTag: { // 允许添加的元素和属性
      div: ['class', 'style']
    }
  },
  comment: {
    enable: false,
    maxLength: null
  }
}
