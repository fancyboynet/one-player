let supportsPassive = false
try {
  const opts = Object.defineProperty({}, 'passive', {
    get () {
      supportsPassive = true
    }
  })
  window.addEventListener('testPassive', null, opts)
  window.removeEventListener('testPassive', null, opts)
} catch (e) {}

export function formatTime (s) {
  s = parseInt(s, 10)
  let hour = Math.floor(s / (60 * 60))
  let min = Math.floor((s % (60 * 60)) / 60)
  let seconds = s % 60
  hour = hour ? hour + ':' : ''
  if (!hour || min >= 10) {
    min = min + ':'
  } else {
    min = '0' + min + ':'
  }
  if (seconds < 10) {
    seconds = '0' + seconds
  }
  return hour + min + seconds
}

export function isFullScreen () {
  return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)
}

export function isM3U8 (url) {
  return /\.m3u8$/i.test(url)
}

export function findIndex (array, callback) {
  let i = -1
  array.some((currentValue, index, array) => {
    const result = callback(currentValue, index, array)
    if (result) {
      i = index
    }
    return result
  })
  return i
}

export function isObject (v) {
  return v !== null && typeof v === 'object'
}

export function isFunction (v) {
  return typeof v === 'function'
}

export function getOffsetToParent (el) {
  const elRect = el.getBoundingClientRect()
  const parentRect = el.parentElement.getBoundingClientRect()
  let elRectRight = elRect.right
  if (!elRect.width) { // ie11 flex getBoundingClientRect width 0
    elRectRight = elRect.right + el.scrollWidth
  }
  return {
    left: Math.round(elRect.left - parentRect.left),
    top: Math.round(elRect.top - parentRect.top),
    right: Math.round(parentRect.right - elRectRight),
    bottom: Math.round(parentRect.bottom - elRect.bottom)
  }
}

export function filterHtml (html, allowTag) {
  html = html.replace(/\n/g, '') // 删除换行符
  const tags = Object.keys(allowTag)

  function isValidNode (node) {
    if (node.tagName.toLowerCase() === 'temp') {
      return true
    }
    return tags.indexOf(node.tagName.toLowerCase()) !== -1
  }

  function filterTag (node) {
    if (node.nodeType !== 1) {
      return
    }
    if (!node.childNodes.length && !isValidNode(node)) {
      node.parentNode.removeChild(node)
      return
    }
    if (isValidNode(node)) {
      Array.from(node.childNodes).forEach(item => {
        filterTag(item)
      })
      return
    }
    const temp = document.createElement('temp')
    Array.from(node.childNodes).forEach(item => {
      temp.appendChild(item)
    })
    node.parentNode.replaceChild(temp, node)
    filterTag(temp)
  }

  function removeTempTag (temp) {
    temp.innerHTML = temp.innerHTML.replace(/<\/?temp>/ig, '')
  }

  function filterAttribute (node) {
    if (node.tagName) {
      const validAttrs = allowTag[node.tagName.toLowerCase()]
      const attrs = node.attributes
      Array.from(attrs).forEach((attr) => {
        if (validAttrs.indexOf(attr.nodeName) === -1) {
          node.removeAttribute(attr.nodeName)
        }
      })
    }
    if (node.children.length) {
      Array.from(node.children).forEach(item => {
        filterAttribute(item)
      })
    }
  }

  const temp = document.createElement('temp')
  temp.innerHTML = html
  filterTag(temp)
  removeTempTag(temp)
  filterAttribute(temp)
  return temp.innerHTML
}

export function convertHtmlToText (html) {
  const temp = document.createElement('div')
  temp.textContent = html
  return temp.innerHTML
}

function isPassiveEvt (type) {
  return findIndex(['wheel', 'mousewheel', 'touchstart', 'touchmove'], (v) => {
    return v === type
  }) !== -1
}

export function bind (el, types, handler, capture = false) {
  if (!Array.isArray(types)) {
    types = [types]
  }
  types.forEach(type => {
    if (!supportsPassive || !isPassiveEvt(type)) {
      el.addEventListener(type, handler, capture)
      return
    }
    el.addEventListener(type, handler, { passive: true })
  })
}

export function unbind (el, types, handler, capture = false) {
  if (!Array.isArray(types)) {
    types = [types]
  }
  types.forEach(type => {
    if (!supportsPassive || !isPassiveEvt(type)) {
      el.removeEventListener(type, handler, capture)
      return
    }
    el.removeEventListener(type, handler, { passive: true })
  })
}

export function hideEl (el) {
  el.classList.add('one-player-hide')
}

export function showEl (el) {
  el.classList.remove('one-player-hide')
}

export function toggleEl (el) {
  el.classList.toggle('one-player-hide')
}

export function getElementWidth (el) {
  return el.clientWidth || el.scrollWidth // ie11 flex clientWidth 0
}

export function getElementHeight (el) {
  return el.clientHeight
}

export function copy (text) {
  const input = document.createElement('input')
  input.style = 'position:absolute;z-index:-100;opacity:0;'
  input.value = text
  window.document.body.appendChild(input)
  input.select()
  try {
    document.execCommand('copy')
  } catch (e) {}
  window.document.body.removeChild(input)
}

export class ResizeObserver {
  constructor (callback) {
    if (window.ResizeObserver) {
      this.ro = new window.ResizeObserver(callback)
      return
    }
    bind(window, 'resize', callback)
  }

  observe (el) {
    if (this.ro) {
      this.ro.observe(el)
      return
    }
    window.dispatchEvent(new window.CustomEvent('resize'))
  }
}
