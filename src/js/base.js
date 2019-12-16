export class AutoBindMethod {
  constructor () {
    Object.getOwnPropertyNames(this.constructor.prototype).forEach(m => {
      this[m] = this[m].bind(this)
    })
  }
}
