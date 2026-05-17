# Vue 3 Migration Notes

This repository is already on Vite, but it is still a Vue 2 application at runtime.

## What was validated

- `npm install --legacy-peer-deps` is currently required on this dependency set because npm 10+ rejects some of the older Apollo / GraphQL peer combinations.
- `npm run build` succeeds on the current Vue 2 stack after reinstalling dependencies.
- The frontend no longer relies on Vue 2 template filters for date formatting, byte formatting, or user initials.

## Why the generic compat plan is not enough here

The suggested "switch to `@vue/compat` first, keep Vuetify 2 until later" flow is not safe for this codebase.

This app depends heavily on Vue 2-era component and plugin packages, including:

- `vuetify@2.3.15`
- `vuescroll@4.16.1`
- `vue-filepond@6.0.3`
- `vuedraggable@2.24.3`
- `vue-apollo@3.0.5`
- `animated-number-vue@1.0.0`
- `vue-status-indicator@1.2.1`

Several of these packages either declare Vue 2-only peer compatibility or are from pre-Vue-3 integration patterns. That means a "runtime swap first, UI migration later" approach is very likely to leave the app unbootable.

## Repo-specific migration order

1. Keep the app on Vue 2 while removing Vue 2-only app code patterns.
2. Replace Vue 2-only libraries with Vue 3-compatible alternatives or wrappers.
3. Migrate the Vuetify surface area module-by-module.
4. Switch the runtime to Vue 3 only after the dependency graph is ready.

## Preparatory work already done on this branch

- Replaced template filters with shared helper accessors:
  - `| moment(...)` -> `$formatMoment(...)`
  - `| prettyBytes` -> `$helpers.prettyBytes(...)`
  - `| initials` -> `$helpers.initials(...)`
- Updated the shared helper plugin so it can register against either:
  - Vue 2 instance prototypes
  - Vue 3 `app.config.globalProperties`

## Major migration tracks still required

### 1. App bootstrap

- `new Vue(...)` -> `createApp(...)`
- global `Vue.use(...)` plugin registration -> `app.use(...)`
- global `Vue.component(...)` registration -> `app.component(...)`

### 2. Router

- `vue-router@3` -> `vue-router@4`
- inline router instances inside `admin.vue`, `profile.vue`, and `tags.vue` need to move to `createRouter(...)`

### 3. Store

- `vuex@3` -> `vuex@4`
- confirm `vuex-pathify` compatibility path before flipping the store runtime

### 4. UI / component libraries

- `vuetify@2` -> `vuetify@3`
- replace or upgrade `vuescroll`
- replace or upgrade `vue-filepond`
- replace or upgrade `vuedraggable`
- replace `animated-number-vue` if no Vue 3 path is available
- verify `vue-status-indicator` compatibility or replace it

### 5. Apollo / i18n / misc plugins

- replace the Vue 2 `vue-apollo` integration with a Vue 3-compatible setup
- verify `@panter/vue-i18next`, `vue-moment`, and `vue-clipboards` compatibility
- convert remaining instance-global patterns such as `Vue.prototype.*`

## Suggested next implementation slice

The next safest chunk is:

1. Introduce a Vue 3-compatible application bootstrap module while still keeping the runtime on Vue 2.
2. Refactor router creation into dedicated factory modules.
3. Convert the Vuex store to `createStore(...)` only after the router/bootstrap refactor is in place.

That keeps the branch moving without landing a broken half-migration.
