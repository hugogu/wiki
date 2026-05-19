import { defineComponent, h } from 'vue'

export const VueScroll = defineComponent({
  name: 'CompatVueScroll',
  inheritAttrs: false,
  props: {
    ops: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    getScrollElement () {
      return this.$refs.container
    },
    refresh () {},
    scrollTo (options) {
      this.getScrollElement()?.scrollTo(options)
    }
  },
  render () {
    const scrollingX = this.ops?.scrollPanel?.scrollingX === true

    return h(
      'div',
      {
        ...this.$attrs,
        ref: 'container',
        class: ['compat-vue-scroll', this.$attrs.class],
        style: {
          display: 'block',
          height: '100%',
          overflowX: scrollingX ? 'auto' : 'hidden',
          overflowY: 'auto',
          width: '100%',
          ...(this.$attrs.style || {})
        }
      },
      this.$slots.default ? this.$slots.default() : []
    )
  }
})

export default {
  install (target) {
    target.component('VueScroll', VueScroll)
  }
}
