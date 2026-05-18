import AdminAnalytics from '../components/admin/admin-analytics.vue'
import AdminApi from '../components/admin/admin-api.vue'
import AdminAuth from '../components/admin/admin-auth.vue'
import AdminComments from '../components/admin/admin-comments.vue'
import AdminContribute from '../components/admin/admin-contribute.vue'
import AdminDashboard from '../components/admin/admin-dashboard.vue'
import AdminDevFlags from '../components/admin/admin-dev-flags.vue'
import AdminEditor from '../components/admin/admin-editor.vue'
import AdminExtensions from '../components/admin/admin-extensions.vue'
import AdminGeneral from '../components/admin/admin-general.vue'
import AdminGroups from '../components/admin/admin-groups.vue'
import AdminGroupsEdit from '../components/admin/admin-groups-edit.vue'
import AdminLocale from '../components/admin/admin-locale.vue'
import AdminLogging from '../components/admin/admin-logging.vue'
import AdminMail from '../components/admin/admin-mail.vue'
import AdminNavigation from '../components/admin/admin-navigation.vue'
import AdminPages from '../components/admin/admin-pages.vue'
import AdminPagesEdit from '../components/admin/admin-pages-edit.vue'
import AdminPagesVisualize from '../components/admin/admin-pages-visualize.vue'
import AdminRendering from '../components/admin/admin-rendering.vue'
import AdminSearch from '../components/admin/admin-search.vue'
import AdminSecurity from '../components/admin/admin-security.vue'
import AdminSsl from '../components/admin/admin-ssl.vue'
import AdminStorage from '../components/admin/admin-storage.vue'
import AdminSystem from '../components/admin/admin-system.vue'
import AdminTags from '../components/admin/admin-tags.vue'
import AdminTheme from '../components/admin/admin-theme.vue'
import AdminUsers from '../components/admin/admin-users.vue'
import AdminUsersEdit from '../components/admin/admin-users-edit.vue'
import AdminUtilities from '../components/admin/admin-utilities.vue'
import AdminWebhooks from '../components/admin/admin-webhooks.vue'

export const adminRoutes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: AdminDashboard },
  { path: '/general', component: AdminGeneral },
  { path: '/locale', component: AdminLocale },
  { path: '/navigation', component: AdminNavigation },
  { path: '/pages', component: AdminPages },
  { path: '/pages/:id(\\d+)', component: AdminPagesEdit },
  { path: '/pages/visualize', component: AdminPagesVisualize },
  { path: '/tags', component: AdminTags },
  { path: '/theme', component: AdminTheme },
  { path: '/groups', component: AdminGroups },
  { path: '/groups/:id(\\d+)', component: AdminGroupsEdit },
  { path: '/users', component: AdminUsers },
  { path: '/users/:id(\\d+)', component: AdminUsersEdit },
  { path: '/analytics', component: AdminAnalytics },
  { path: '/auth', component: AdminAuth },
  { path: '/comments', component: AdminComments },
  { path: '/rendering', component: AdminRendering },
  { path: '/editor', component: AdminEditor },
  { path: '/extensions', component: AdminExtensions },
  { path: '/logging', component: AdminLogging },
  { path: '/search', component: AdminSearch },
  { path: '/storage', component: AdminStorage },
  { path: '/api', component: AdminApi },
  { path: '/mail', component: AdminMail },
  { path: '/security', component: AdminSecurity },
  { path: '/ssl', component: AdminSsl },
  { path: '/system', component: AdminSystem },
  { path: '/utilities', component: AdminUtilities },
  { path: '/webhooks', component: AdminWebhooks },
  { path: '/dev-flags', component: AdminDevFlags },
  { path: '/contribute', component: AdminContribute }
]
