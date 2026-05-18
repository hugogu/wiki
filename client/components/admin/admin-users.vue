<template lang='pug'>
  v-container(fluid, grid-list-lg)
    v-layout(row, wrap)
      v-flex(xs12)
        .admin-header
          img.animated.fadeInUp(src='/_assets/svg/icon-customer.svg', alt='Users', style='width: 80px;')
          .admin-header-title
            .headline.blue--text.text--darken-2.animated.fadeInLeft Users
            .subtitle-1.grey--text.animated.fadeInLeft.wait-p2s Manage users
          v-spacer
          v-btn.animated.fadeInDown.wait-p2s.mr-3(outlined, color='grey', icon, @click='refresh')
            v-icon mdi-refresh
          v-btn.animated.fadeInDown(color='primary', large, depressed, @click='createUser')
            v-icon(left) mdi-plus
            span New User
        v-card.mt-3.animated.fadeInUp
          .pa-2.d-flex.align-center(:class='$vuetify.theme.dark ? `grey darken-3-d5` : `grey lighten-3`')
            v-text-field(
              solo
              flat
              v-model='search'
              prepend-inner-icon='mdi-account-search-outline'
              label='Search Users...'
              hide-details
              style='max-width: 400px;'
              dense
              )
            v-spacer
            select.admin-filter-select(v-model='filterStrategy')
              option(v-for='strategy in strategies', :key='strategy.key', :value='strategy.key') {{ strategy.displayName }}
          v-divider
          v-progress-linear(v-if='loading', indeterminate, color='primary')
          .admin-users-table(v-else-if='pagedUsers.length > 0')
            .admin-users-row.is-clickable(v-for='user in pagedUsers', :key='user.id', @click='$router.push(`/users/` + user.id)')
              .body-2
                strong {{ user.id }} - {{ user.name }}
              .caption {{ user.email }}
              .caption Provider: {{ getStrategyName(user.providerKey) }}
              .caption Created: {{ formatMoment(user.createdAt, 'from') }}
              .caption
                span(v-if='user.lastLoginAt') Last login: {{ formatMoment(user.lastLoginAt, 'from') }}
                em.grey--text(v-else) Never logged in
              .caption Status: {{ user.isSystem ? 'System / ' : '' }}{{ user.isActive ? 'Active' : 'Inactive' }}
          .pa-3(v-else)
            v-alert.text-left(icon='mdi-alert', outlined, color='grey')
              em.body-2 No users to display!
          v-card-chin(v-if='pageCount > 1')
            v-spacer
            v-pagination(v-model='pagination', :length='pageCount')
            v-spacer

    user-create(v-model='isCreateDialogShown', @refresh='refresh(false)')
</template>

<script>
import _ from 'lodash'
import gql from 'graphql-tag'

import { StatusIndicator } from 'vue-status-indicator'
import UserCreate from './admin-users-create.vue'

export default {
  components: {
    StatusIndicator,
    UserCreate
  },
  mounted () {
    this.loadUsers()
  },
  data() {
    return {
      selected: [],
      pagination: 1,
      users: [],
      strategies: [],
      filterStrategy: 'all',
      search: '',
      loading: false,
      isCreateDialogShown: false
    }
  },
  computed: {
    usersFiltered () {
      const users = _.isArray(this.users) ? this.users : []
      const all = this.filterStrategy === 'all' || this.filterStrategy === ''
      const search = _.toLower(_.trim(this.search))
      const filtered = _.filter(users, u => {
        if (!all && u.providerKey !== this.filterStrategy) {
          return false
        }
        if (search) {
          const haystack = _.toLower([
            u.id,
            u.name,
            u.email,
            u.providerKey
          ].join(' '))

          if (!haystack.includes(search)) {
            return false
          }
        }
        return true
      })

      return _.orderBy(filtered, ['name', 'id'], ['asc', 'asc'])
    },
    pagedUsers () {
      const start = (this.pagination - 1) * 15
      return this.usersFiltered.slice(start, start + 15)
    },
    pageCount () {
      return Math.max(1, Math.ceil(this.usersFiltered.length / 15))
    }
  },
  watch: {
    search () {
      this.pagination = 1
    },
    filterStrategy () {
      this.pagination = 1
    },
    pageCount (newValue) {
      if (this.pagination > newValue) {
        this.pagination = newValue
      }
    }
  },
  methods: {
    formatMoment (value, format = 'LLL') {
      return this.$helpers?.formatMoment
        ? this.$helpers.formatMoment(value, format)
        : (typeof this.$formatMoment === 'function' ? this.$formatMoment(value, format) : '')
    },
    async loadUsers () {
      this.loading = true
      this.$store.commit('loadingStart', 'admin-users-refresh')
      this.$store.commit('loadingStart', 'admin-users-strategies-refresh')

      try {
        const [usersResp, strategiesResp] = await Promise.all([
          this.$apollo.query({
            query: gql`
              query {
                users {
                  list {
                    id
                    name
                    email
                    providerKey
                    isSystem
                    isActive
                    createdAt
                    lastLoginAt
                  }
                }
              }
            `,
            fetchPolicy: 'network-only'
          }),
          this.$apollo.query({
            query: gql`
              query {
                authentication {
                  activeStrategies {
                    key
                    displayName
                  }
                }
              }
            `,
            fetchPolicy: 'network-only'
          })
        ])

        this.users = _.get(usersResp, 'data.users.list', [])
        this.strategies = _.concat({
          key: 'all',
          displayName: 'All Providers'
        }, _.get(strategiesResp, 'data.authentication.activeStrategies', []))

        document.documentElement.setAttribute('data-admin-users-len', String(this.users.length))
        document.documentElement.setAttribute('data-admin-user-strategies-len', String(this.strategies.length))
      } catch (err) {
        this.$store.commit('pushGraphError', err)
      } finally {
        this.loading = false
        this.$store.commit('loadingStop', 'admin-users-refresh')
        this.$store.commit('loadingStop', 'admin-users-strategies-refresh')
      }
    },
    createUser() {
      this.isCreateDialogShown = true
    },
    async refresh(notify = true) {
      await this.loadUsers()
      if (notify) {
        this.$store.commit('showNotification', {
          message: 'Users list has been refreshed.',
          style: 'success',
          icon: 'cached'
        })
      }
    },
    getStrategyName(key) {
      return (_.find(this.strategies, ['key', key]) || {}).displayName || key
    }
  }
}
</script>

<style lang='scss'>
.admin-users-table {
  padding: 12px 16px;
}

.admin-users-row {
  padding: 12px 0;
  border-top: 1px solid rgba(0, 0, 0, .08);

  &:first-child {
    border-top: none;
  }
}

.admin-filter-select {
  max-width: 300px;
  min-width: 220px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid rgba(0, 0, 0, .12);
  border-radius: 4px;
  background: #fff;
}
</style>
