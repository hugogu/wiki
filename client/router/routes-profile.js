export const profileRoutes = [
  { path: '/', redirect: '/profile' },
  { path: '/profile', component: () => import(/* webpackChunkName: "profile" */ '../components/profile/profile.vue') },
  { path: '/pages', component: () => import(/* webpackChunkName: "profile" */ '../components/profile/pages.vue') },
  { path: '/comments', component: () => import(/* webpackChunkName: "profile" */ '../components/profile/comments.vue') }
]
