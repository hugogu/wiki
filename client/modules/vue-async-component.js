import { defineAsyncComponent } from 'vue'

export function defineCompatAsyncComponent (loader) {
  return defineAsyncComponent(loader)
}
