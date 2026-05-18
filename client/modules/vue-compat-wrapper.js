// Proxy module for @vue/compat that patches withCtx to handle Vuetify 2's
// slot-type inspection, which can call slot functions without slot props.
import * as VueModule from '@vue/compat'

export * from '@vue/compat'
export default VueModule.default || VueModule

const origWithCtx = typeof VueModule.withCtx === 'function'
  ? VueModule.withCtx
  : (fn) => fn

export function withCtx (fn, ctx) {
  const wrapped = function (props) {
    return fn.call(this, props === undefined ? {} : props)
  }

  return origWithCtx(wrapped, ctx)
}
