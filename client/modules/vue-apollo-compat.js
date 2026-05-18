const hasOwn = (holder, key) => typeof holder !== 'undefined' && Object.prototype.hasOwnProperty.call(holder, key)

function initApolloProviderCompat () {
  const optionValue = this.$options.apolloProvider

  if (optionValue) {
    this.$apolloProvider = typeof optionValue === 'function' ? optionValue() : optionValue
    return
  }

  if (this.$parent?.$apolloProvider) {
    this.$apolloProvider = this.$parent.$apolloProvider
    return
  }

  const provided = typeof this.$options.provide === 'function'
    ? this.$options.provide.call(this)
    : this.$options.provide

  if (provided?.$apolloProvider) {
    this.$apolloProvider = provided.$apolloProvider
  }
}

function proxyApolloDataCompat () {
  this.$_apolloInitData = {}

  const apollo = this.$options.apollo
  if (!apollo) {
    return
  }

  for (const key in apollo) {
    if (key.charAt(0) === '$') {
      continue
    }

    const options = apollo[key]
    if (options?.manual) {
      continue
    }

    if (hasOwn(this.$options.props, key) || hasOwn(this.$options.computed, key) || hasOwn(this.$options.methods, key)) {
      continue
    }

    Object.defineProperty(this, key, {
      get: () => this.$data.$apolloData.data[key],
      set: value => {
        this.$_apolloInitData[key] = value
      },
      enumerable: true,
      configurable: true
    })
  }
}

export function installVueApolloCompatMixin (Vue) {
  if (!Vue?.version?.startsWith('3') || Vue.__wikiVueApolloCompatInstalled) {
    return
  }

  Vue.mixin({
    data () {
      return {
        $apolloData: {
          queries: {},
          loading: 0,
          data: this.$_apolloInitData
        }
      }
    },
    beforeCreate () {
      initApolloProviderCompat.call(this)
      proxyApolloDataCompat.call(this)
    }
  })

  Vue.__wikiVueApolloCompatInstalled = true
}
