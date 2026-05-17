import { createEventBus } from './event-bus'

const pageEventBus = createEventBus()

export const PAGE_EVENTS = {
  CONVERT: 'pageConvert',
  DELETE: 'pageDelete',
  DUPLICATE: 'pageDuplicate',
  EDIT: 'pageEdit',
  HISTORY: 'pageHistory',
  MOVE: 'pageMove',
  SOURCE: 'pageSource'
}

export const SEARCH_EVENTS = {
  ENTER: 'searchEnter',
  MOVE: 'searchMove'
}

export function emitPageEvent (event, payload) {
  pageEventBus.emit(event, payload)
}

export function onPageEvent (event, handler) {
  return pageEventBus.on(event, handler)
}
