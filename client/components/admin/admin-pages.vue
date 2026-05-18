<template lang='pug'>
  v-container(fluid, grid-list-lg)
    v-layout(row wrap)
      v-flex(xs12)
        .admin-header
          img.animated.fadeInUp(src='/_assets/svg/icon-file.svg', alt='Page', style='width: 80px;')
          .admin-header-title
            .headline.blue--text.text--darken-2.animated.fadeInLeft Pages
            .subtitle-1.grey--text.animated.fadeInLeft.wait-p2s Manage pages
          v-spacer
          v-btn.animated.fadeInDown.wait-p1s(icon, color='grey', outlined, @click='refresh')
            v-icon.grey--text mdi-refresh
          //- v-btn.animated.fadeInDown.mx-3(color='primary', outlined, @click='recyclebin', disabled)
          //-   v-icon(left) mdi-delete-outline
          //-   span Recycle Bin
          v-btn.animated.fadeInDown(color='primary', depressed, large, to='pages/visualize')
            v-icon(left) mdi-graph
            span Visualize
        v-card.mt-3.animated.fadeInUp
          .pa-2.d-flex.align-center(:class='$vuetify.theme.dark ? `grey darken-3-d5` : `grey lighten-3`')
            v-text-field(
              solo
              flat
              v-model='search'
              prepend-inner-icon='mdi-file-search-outline'
              label='Search Pages...'
              hide-details
              dense
              style='max-width: 400px;'
              )
            v-spacer
            select.admin-filter-select.ml-2(v-model='selectedLang')
              option(v-for='lang in langs', :key='lang.value === null ? `all` : lang.value', :value='lang.value') {{ lang.text }}
            select.admin-filter-select.ml-2(v-model='selectedState')
              option(v-for='state in states', :key='String(state.value)', :value='state.value') {{ state.text }}
          v-divider
          v-progress-linear(v-if='loading', indeterminate, color='primary')
          .admin-pages-table(v-else-if='pagedPages.length > 0')
            .admin-pages-row.is-clickable(v-for='page in pagedPages', :key='page.id', @click='$router.push(`/pages/` + page.id)')
              .body-2
                strong {{ page.id }} - {{ page.title }}
              .caption {{ page.description }}
              .caption {{ page.locale }} / {{ page.path }}
              .caption Created: {{ formatMoment(page.createdAt, 'calendar') }}
              .caption Updated: {{ formatMoment(page.updatedAt, 'calendar') }}
          v-alert.ma-3(v-else, icon='mdi-alert', outlined) No pages to display.
          .text-center.py-2.animated.fadeInDown(v-if='pageTotal > 1')
            v-pagination(v-model='pagination', :length='pageTotal')
</template>

<script>
import _ from 'lodash'
import pagesQuery from 'gql/admin/pages/pages-query-list.gql'

export default {
  mounted () {
    this.loadPages()
  },
  data() {
    return {
      selectedPage: {},
      pagination: 1,
      pages: [],
      search: '',
      selectedLang: null,
      selectedState: null,
      states: [
        { text: 'All Publishing States', value: null },
        { text: 'Published', value: true },
        { text: 'Not Published', value: false }
      ],
      loading: false
    }
  },
  computed: {
    filteredPages () {
      const pages = _.isArray(this.pages) ? this.pages : []
      const search = _.toLower(_.trim(this.search))
      const filtered = _.filter(pages, pg => {
        if (this.selectedLang !== null && this.selectedLang !== pg.locale) {
          return false
        }
        if (this.selectedState !== null && this.selectedState !== pg.isPublished) {
          return false
        }
        if (search) {
          const haystack = _.toLower([
            pg.id,
            pg.title,
            pg.description,
            pg.locale,
            pg.path
          ].join(' '))

          if (!haystack.includes(search)) {
            return false
          }
        }
        return true
      })

      return _.orderBy(filtered, ['updatedAt'], ['desc'])
    },
    pagedPages () {
      const start = (this.pagination - 1) * 15
      return this.filteredPages.slice(start, start + 15)
    },
    pageTotal () {
      return Math.max(1, Math.ceil(this.filteredPages.length / 15))
    },
    langs () {
      const pages = _.isArray(this.pages) ? this.pages : []
      return _.concat({
        text: 'All Locales',
        value: null
      }, _.uniqBy(pages, 'locale').map(pg => ({
        text: pg.locale,
        value: pg.locale
      })))
    }
  },
  watch: {
    search () {
      this.pagination = 1
    },
    selectedLang () {
      this.pagination = 1
    },
    selectedState () {
      this.pagination = 1
    },
    pageTotal (newValue) {
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
    async loadPages () {
      this.loading = true
      this.$store.commit('loadingStart', 'admin-pages-refresh')

      try {
        const resp = await this.$apollo.query({
          query: pagesQuery,
          fetchPolicy: 'network-only'
        })

        this.pages = _.get(resp, 'data.pages.list', [])
        document.documentElement.setAttribute('data-admin-pages-len', String(this.pages.length))
      } catch (err) {
        this.$store.commit('pushGraphError', err)
      } finally {
        this.loading = false
        this.$store.commit('loadingStop', 'admin-pages-refresh')
      }
    },
    async refresh() {
      await this.loadPages()
      this.$store.commit('showNotification', {
        message: 'Page list has been refreshed.',
        style: 'success',
        icon: 'cached'
      })
    },
    newpage() {
      this.pageSelectorShown = true
    },
    recyclebin () { }
  }
}
</script>

<style lang='scss'>
.admin-pages-table {
  padding: 12px 16px;
}

.admin-pages-row {
  padding: 12px 0;
  border-top: 1px solid rgba(0, 0, 0, .08);

  &:first-child {
    border-top: none;
  }
}

.admin-filter-select {
  max-width: 250px;
  min-width: 180px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid rgba(0, 0, 0, .12);
  border-radius: 4px;
  background: #fff;
}

.admin-pages-path {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-family: 'Roboto Mono', monospace;
}
</style>
