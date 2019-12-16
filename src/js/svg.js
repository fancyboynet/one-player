export default class SvgAnimation {
  constructor (pathIni, pathFin, pathEle, timingFunction, attr) {
    this.dir = 1
    this.rID = null
    this.cf = 0
    this.NF = 20
    this.path = pathEle
    this.attr = attr || 'd'
    this.status = ''
    this.O = {
      d: {
        ini: this.pathToArray(pathIni),
        fin: this.pathToArray(pathFin),
        afn: function (pts) {
          return pts.join(' ')
        },
        tfn: timingFunction || 'ease-in-out'
      }
    }
    this.setRng()
  }

  reverse () {
    [this.O.d.ini, this.O.d.fin] = [this.O.d.fin, this.O.d.ini]
    return this
  }

  setStatus (status) {
    this.status = status
    return this
  }

  setIni (ini) {
    this.O.d.ini = this.pathToArray(ini)
    return this
  }

  setFin (fin) {
    this.O.d.fin = this.pathToArray(fin)
    return this
  }

  reset () {
    this.cf = 0
    return this
  }

  setRng () {
    this.O.d.rng = this.range(this.O.d.ini, this.O.d.fin)
    return this
  }

  update () {
    this.cf += this.dir
    const k = this.cf / this.NF
    const c = this.O.d
    this.path.setAttribute(...[
      this.attr,
      c.afn(this.int(c.ini, c.rng, SvgAnimation.TFN[c.tfn], k))
    ])
    if (!(this.cf % this.NF)) {
      this.stopAni()
      return
    }
    this.rID = window.requestAnimationFrame(this.update.bind(this))
  }

  int (ini, rng, tfn, k) {
    if (typeof ini === 'number') {
      return ini + tfn(k) * rng
    } else if (typeof ini === 'string') {
      return ini
    } else {
      return ini.map((c, i) => this.int(ini[i], rng[i], tfn, k))
    }
  }

  range (ini, fin) {
    if (typeof ini === 'object') {
      return ini.map((c, i) => this.range(ini[i], fin[i]))
    } else if (typeof +ini === 'number' && !isNaN(ini)) {
      return +fin - +ini
    } else {
      return ini
    }
  }

  stopAni () {
    window.cancelAnimationFrame(this.rID)
    this.rID = null
  }

  pathToArray (path) {
    const reg = /[a-zA-Z][\s*\d\-.,]+/g
    let tempReg = ''
    let points = []
    while (tempReg = reg.exec(path)) { // eslint-disable-line
      const str = tempReg[0]
      const pathPoints = str.substr(1, str.length).replace(/,/g, ' ').trim().split(' ')
      const isCapitalization = str.substr(0, 1) === str.substr(0, 1).toUpperCase()
      points.push(str.substr(0, 1).toUpperCase())
      if (isCapitalization) {
        points = points.concat(pathPoints.map(i => +i))
      } else {
        pathPoints.forEach((point, index) => {
          let base = 0
          if (index <= 1) {
            base = /\d/.test(points[points.length - 3]) && points[points.length - 3]
          } else if (index <= 3) {
            base = /\d/.test(points[points.length - 5]) && points[points.length - 5]
          } else if (index <= 5) {
            base = /\d/.test(points[points.length - 7]) && points[points.length - 7]
          }
          base = +base + +point
          points.push(base)
        })
      }
    }
    return points
  }
}

SvgAnimation.TFN = {
  'ease-out': function (k) {
    return 1 - Math.pow(1 - k, 1.675)
  },
  'ease-in-out': function (k) {
    return 0.5 * (Math.sin((k - 0.5) * Math.PI) + 1)
  },
  'bounce-ini-fin': function (k, s = -0.65 * Math.PI, e = -s) {
    return (Math.sin(k * (e - s) + s) - Math.sin(s)) / (Math.sin(e) - Math.sin(s))
  }
}
