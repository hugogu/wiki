<template lang="pug">
  v-dialog(
    v-model='dialogOpen'
    max-width='650'
    )
    v-card
      .dialog-header
        span {{$t('common:user.search')}}
        v-spacer
        v-progress-circular(
          indeterminate
          color='white'
          :size='20'
          :width='2'
          v-show='searchLoading'
          )
      v-card-text.pt-5
        v-text-field(
          outlined
          :label='$t(`common:user.searchPlaceholder`)'
          v-model='search'
          prepend-inner-icon='mdi-account-search-outline'
          color='primary'
          ref='searchIpt'
          hide-details
          )
        v-list.grey.mt-3.py-0.radius-7(
          :class='$vuetify.theme.dark ? `darken-3-d5` : `lighten-3`'
          two-line
          dense
          )
          template(v-for='(usr, idx) in items', :key='usr.id')
            v-list-item(@click='setUser(usr)')
              v-list-item-avatar(size='40', color='primary')
                span.body-1.white--text {{ $helpers.initials(usr.name) }}
              v-list-item-content
                v-list-item-title.body-2 {{usr.name}}
                v-list-item-subtitle {{usr.email}}
              v-list-item-action
                v-icon(color='primary') mdi-arrow-right
            v-divider.my-0(v-if='idx < items.length - 1')
      v-card-chin
        v-spacer
        v-btn(
          text
          @click='close'
          :disabled='loading'
          ) {{$t('common:actions.cancel')}}
</template>

<script>
import _ from 'lodash'
import gql from 'graphql-tag'
import { emitCompatModelValue, getCompatModelValue } from '../../modules/vue-model-compat'

export default {
  props: {
    multiple: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Boolean
    },
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      searchLoading: false,
      search: '',
      items: []
    }
  },
  computed: {
    dialogValue () {
      return getCompatModelValue(this)
    },
    dialogOpen: {
      get() { return this.dialogValue },
      set(value) { emitCompatModelValue(this, value) }
    }
  },
  watch: {
    dialogValue(newValue, oldValue) {
      if (newValue && !oldValue) {
        this.search = ''
        this.selectedItems = null
        _.delay(() => { this.$refs.searchIpt.focus() }, 100)
      }
    }
  },
  methods: {
    close() {
      emitCompatModelValue(this, false)
    },
    setUser(usr) {
      this.$emit('select', usr)
      this.close()
    },
    searchFilter(item, queryText, itemText) {
      return _.includes(_.toLower(item.email), _.toLower(queryText)) || _.includes(_.toLower(item.name), _.toLower(queryText))
    }
  },
  apollo: {
    items: {
      query: gql`
        query ($query: String!) {
          users {
            search(query:$query) {
              id
              name
              email
              providerKey
            }
          }
        }
      `,
      variables() {
        return {
          query: this.search
        }
      },
      fetchPolicy: 'cache-and-network',
      skip() {
        return !this.search || this.search.length < 2
      },
      update: (data) => data.users.search,
      watchLoading (isLoading) {
        this.searchLoading = isLoading
      }
    }
  }
}
</script>
