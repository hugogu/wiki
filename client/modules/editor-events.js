import { createEventBus } from './event-bus'

const editorEventBus = createEventBus()

export const EDITOR_EVENTS = {
  INSERT: 'editorInsert',
  LINK_TO_PAGE: 'editorLinkToPage',
  OVERWRITE_CONTENT: 'overwriteEditorContent',
  RESET_CONFLICT: 'resetEditorConflict',
  SAVE_CONFLICT: 'saveConflict'
}

export function emitEditorEvent (event, payload) {
  editorEventBus.emit(event, payload)
}

export function onEditorEvent (event, handler) {
  return editorEventBus.on(event, handler)
}
