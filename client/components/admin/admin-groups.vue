<template lang='pug'>
  v-container(fluid, grid-list-lg)
    v-layout(row wrap)
      v-flex(xs12)
        .admin-header
          img.animated.fadeInUp(src='/_assets/svg/icon-people.svg', alt='Groups', style='width: 80px;')
          .admin-header-title
            .headline.blue--text.text--darken-2.animated.fadeInLeft Groups
            .subtitle-1.grey--text.animated.fadeInLeft.wait-p4s Manage groups and their permissions
          v-spacer
          v-btn.animated.fadeInDown.wait-p3s(icon, outlined, color='grey', href='https://docs.requarks.io/groups', target='_blank')
            v-icon mdi-help-circle
          v-btn.animated.fadeInDown.wait-p2s.mx-3(color='grey', outlined, @click='refresh', icon)
            v-icon mdi-refresh
          v-btn.animated.fadeInDown(color='primary', depressed, @click='promptNewGroup', large)
            v-icon(left) mdi-plus
            span New Group
        v-card.mt-3.animated.fadeInUp
          v-progress-linear(v-if='loading', indeterminate, color='primary')
          .admin-groups-table(v-else-if='pagedGroups.length > 0')
            .admin-groups-row.is-clickable(v-for='group in pagedGroups', :key='group.id', @click='$router.push(`/groups/` + group.id)')
              .body-2
                strong {{ group.id }} - {{ group.name }}
              .caption Users: {{ group.userCount }}
              .caption Created: {{ formatMoment(group.createdAt, 'calendar') }}
              .caption Updated: {{ formatMoment(group.updatedAt, 'calendar') }}
              .caption(v-if='group.isSystem') System Group
          v-alert.ma-3(v-else, icon='mdi-alert', :value='true', outline) No groups to display.
          .text-xs-center.py-2(v-if='pageCount > 1')
            v-pagination(v-model='pagination', :length='pageCount')
</template>

<script>
import _ from 'lodash'

import groupsQuery from 'gql/admin/groups/groups-query-list.gql'
import createGroupMutation from 'gql/admin/groups/groups-mutation-create.gql'

export default {
  mounted () {
    this.loadGroups()
  },
  data() {
    return {
      newGroupName: '',
      selectedGroup: {},
      pagination: 1,
      groups: [],
      search: '',
      loading: false
    }
  },
  watch: {
  },
  computed: {
    sortedGroups () {
      const groups = _.isArray(this.groups) ? this.groups : []
      return _.orderBy(groups, ['id'], ['asc'])
    },
    pagedGroups () {
      const start = (this.pagination - 1) * 15
      return this.sortedGroups.slice(start, start + 15)
    },
    pageCount () {
      return Math.max(1, Math.ceil(this.sortedGroups.length / 15))
    }
  },
  methods: {
    async promptNewGroup () {
      const name = window.prompt('Group Name', this.newGroupName || '')

      if (name === null) {
        return
      }

      this.newGroupName = name
      await this.createGroup()
    },
    formatMoment (value, format = 'LLL') {
      return this.$helpers?.formatMoment
        ? this.$helpers.formatMoment(value, format)
        : (typeof this.$formatMoment === 'function' ? this.$formatMoment(value, format) : '')
    },
    async loadGroups () {
      this.loading = true
      this.$store.commit('loadingStart', 'admin-groups-refresh')

      try {
        const resp = await this.$apollo.query({
          query: groupsQuery,
          fetchPolicy: 'network-only'
        })

        this.groups = _.get(resp, 'data.groups.list', [])
        document.documentElement.setAttribute('data-admin-groups-len', String(this.groups.length))
      } catch (err) {
        this.$store.commit('pushGraphError', err)
      } finally {
        this.loading = false
        this.$store.commit('loadingStop', 'admin-groups-refresh')
      }
    },
    async refresh() {
      await this.loadGroups()
      this.$store.commit('showNotification', {
        message: 'Groups have been refreshed.',
        style: 'success',
        icon: 'cached'
      })
    },
    async createGroup() {
      if (_.trim(this.newGroupName).length < 1) {
        this.$store.commit('showNotification', {
          style: 'red',
          message: 'Enter a group name.',
          icon: 'warning'
        })
        return
      }
      try {
        await this.$apollo.mutate({
          mutation: createGroupMutation,
          variables: {
            name: this.newGroupName
          },
          update (store, resp) {
            const data = _.get(resp, 'data.groups.create', { responseResult: {} })
            if (data.responseResult.succeeded === true) {
              const apolloData = store.readQuery({ query: groupsQuery })
              data.group.userCount = 0
              apolloData.groups.list.push(data.group)
              store.writeQuery({ query: groupsQuery, data: apolloData })
            } else {
              throw new Error(data.responseResult.message)
            }
          },
          watchLoading (isLoading) {
            this.$store.commit(`loading${isLoading ? 'Start' : 'Stop'}`, 'admin-groups-create')
          }
        })
        this.newGroupName = ''
        this.$store.commit('showNotification', {
          style: 'success',
          message: `Group has been created successfully.`,
          icon: 'check'
        })
      } catch (err) {
        this.$store.commit('pushGraphError', err)
      }
    }
  }
}
</script>

<style lang='scss'>
.admin-groups-table {
  padding: 12px 16px;
}

.admin-groups-row {
  padding: 12px 0;
  border-top: 1px solid rgba(0, 0, 0, .08);

  &:first-child {
    border-top: none;
  }
}
</style>
