import ProfileComments from '../components/profile/comments.vue'
import ProfilePages from '../components/profile/pages.vue'
import ProfileProfile from '../components/profile/profile.vue'

export const profileRoutes = [
  { path: '/', redirect: '/profile' },
  { path: '/profile', component: ProfileProfile },
  { path: '/pages', component: ProfilePages },
  { path: '/comments', component: ProfileComments }
]
