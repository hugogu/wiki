import _ from 'lodash'
import pathify from 'vuex-pathify' // eslint-disable-line import/no-duplicates
import { make } from 'vuex-pathify' // eslint-disable-line import/no-duplicates

import page from './page'
import site from './site'
import user from './user'

const state = {
  loadingStack: [],
  notification: {
    message: '',
    style: 'primary',
    icon: 'cached',
    isActive: false
  }
}

export function createRootStoreOptions () {
  return {
    strict: import.meta.env.PROD === false,
    plugins: [
      pathify.plugin
    ],
    state,
    getters: {
      isLoading: state => { return state.loadingStack.length > 0 }
    },
    mutations: {
      ...make.mutations(state),
      loadingStart (st, stackName) {
        st.loadingStack = _.union(st.loadingStack, [stackName])
      },
      loadingStop (st, stackName) {
        st.loadingStack = _.without(st.loadingStack, stackName)
      },
      showNotification (st, opts) {
        st.notification = _.defaults(opts, {
          message: '',
          style: 'primary',
          icon: 'cached',
          isActive: true
        })
      },
      updateNotificationState (st, newState) {
        st.notification.isActive = newState
      },
      pushGraphError (st, err) {
        st.notification = _.defaults({
          style: 'red',
          message: _.get(err, 'graphQLErrors[0].message', err.message),
          icon: 'alert'
        }, {
          message: '',
          style: 'primary',
          icon: 'cached',
          isActive: true
        })
      }
    },
    actions: { },
    modules: {
      page,
      site,
      user
    }
  }
}
