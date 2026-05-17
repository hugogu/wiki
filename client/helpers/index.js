import filesize from 'filesize.js'
import _ from 'lodash'
import moment from 'moment-timezone'

/* global siteConfig */

const helpers = {
  /**
   * Convert bytes to humanized form
   * @param {number} rawSize Size in bytes
   * @returns {string} Humanized file size
   */
  filesize (rawSize) {
    return _.toUpper(filesize(rawSize))
  },
  prettyBytes (rawSize) {
    if (typeof rawSize !== 'number' || isNaN(rawSize)) {
      throw new TypeError('Expected a number')
    }

    let num = rawSize
    const neg = num < 0
    const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    if (neg) {
      num = -num
    }
    if (num < 1) {
      return `${neg ? '-' : ''}${num} B`
    }

    const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
    const value = (num / Math.pow(1000, exponent)).toFixed(2) * 1
    const unit = units[exponent]

    return `${neg ? '-' : ''}${value} ${unit}`
  },
  initials (value = '') {
    return String(value).split(' ').map(v => v.substring(0, 1)).join('')
  },
  formatMoment (value, format = 'LLL') {
    const date = moment(value)

    if (!date.isValid()) {
      return ''
    }

    switch (format) {
      case 'calendar':
        return date.calendar()
      case 'from':
        return date.fromNow()
      default:
        return date.format(format)
    }
  },
  /**
   * Convert raw path to safe path
   * @param {string} rawPath Raw path
   * @returns {string} Safe path
   */
  makeSafePath (rawPath) {
    let rawParts = _.split(_.trim(rawPath), '/')
    rawParts = _.map(rawParts, (r) => {
      return _.kebabCase(_.deburr(_.trim(r)))
    })

    return _.join(_.filter(rawParts, (r) => { return !_.isEmpty(r) }), '/')
  },
  resolvePath (path) {
    if (_.startsWith(path, '/')) { path = path.substring(1) }
    return `${siteConfig.path}${path}`
  },
  /**
   * Set Input Selection
   * @param {DOMElement} input The input element
   * @param {number} startPos The starting position
   * @param {nunber} endPos The ending position
   */
  setInputSelection (input, startPos, endPos) {
    input.focus()
    if (typeof input.selectionStart !== 'undefined') {
      input.selectionStart = startPos
      input.selectionEnd = endPos
    } else if (document.selection && document.selection.createRange) {
      // IE branch
      input.select()
      var range = document.selection.createRange()
      range.collapse(true)
      range.moveEnd('character', endPos)
      range.moveStart('character', startPos)
      range.select()
    }
  }
}

export default {
  install(appOrVue) {
    const descriptors = {
      $helpers: {
        get() {
          return helpers
        }
      },
      $formatMoment: {
        get() {
          return helpers.formatMoment
        }
      }
    }

    if (appOrVue?.config?.globalProperties) {
      Object.defineProperties(appOrVue.config.globalProperties, descriptors)
      appOrVue.$helpers = helpers
      return
    }

    appOrVue.$helpers = helpers
    Object.defineProperties(appOrVue.prototype, descriptors)
  }
}
