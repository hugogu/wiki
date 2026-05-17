import { defineCompatAsyncComponent } from '../modules/vue-async-component'

export const profileRoutes = [
  { path: '/', redirect: '/profile' },
  { path: '/profile', component: defineCompatAsyncComponent(() => import(/* webpackChunkName: "profile" */ '../components/profile/profile.vue')) },
  { path: '/pages', component: defineCompatAsyncComponent(() => import(/* webpackChunkName: "profile" */ '../components/profile/pages.vue')) },
  { path: '/comments', component: defineCompatAsyncComponent(() => import(/* webpackChunkName: "profile" */ '../components/profile/comments.vue')) }
]
