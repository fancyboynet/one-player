import { findIndex } from './utils'
const plugins = []
export default class Plugin {
  constructor (player) {
    this.player = player
  }
}

export function addPlugin (P, opt) {
  if (!(P.prototype instanceof Plugin)) {
    throw new Error(`${P.name} must extend from Plugin`)
  }
  const pluginIndex = findIndex(plugins, item => item[0] === P)
  if (pluginIndex !== -1) {
    return
  }
  plugins.push([P, opt])
}

export function initPlugins (player) {
  return plugins.map((p) => {
    new p[0](player, p[1])
  })
}
