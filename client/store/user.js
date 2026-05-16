import { make } from 'vuex-pathify'
import Cookies from 'js-cookie'
import { Base64 } from 'js-base64'

const decodeJWT = (token) => {
  const parts = token.split('.')
  if (parts.length < 2) {
    throw new Error('Invalid JWT format')
  }

  return JSON.parse(Base64.decode(parts[1]))
}

const state = {
  id: 0,
  email: '',
  name: '',
  pictureUrl: '',
  localeCode: '',
  defaultEditor: '',
  timezone: '',
  dateFormat: '',
  appearance: '',
  permissions: [],
  iat: 0,
  exp: 0,
  authenticated: false
}

export default {
  namespaced: true,
  state,
  mutations: {
    ...make.mutations(state),
    REFRESH_AUTH(st) {
      const jwtCookie = Cookies.get('jwt')
      if (jwtCookie) {
        try {
          const jwtData = decodeJWT(jwtCookie)
          st.id = jwtData.id
          st.email = jwtData.email
          st.name = jwtData.name
          st.pictureUrl = jwtData.av
          st.localeCode = jwtData.lc
          st.timezone = jwtData.tz || Intl.DateTimeFormat().resolvedOptions().timeZone || ''
          st.dateFormat = jwtData.df || ''
          st.appearance = jwtData.ap || ''
          // st.defaultEditor = jwtData.defaultEditor
          st.permissions = jwtData.permissions
          st.iat = jwtData.iat
          st.exp = jwtData.exp
          st.authenticated = true
        } catch (err) {
          console.debug('Invalid JWT. Silent authentication skipped.')
        }
      }
    }
  }
}
