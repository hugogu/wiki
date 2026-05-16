# Vite Migration Playbook

## Purpose

Use this playbook when migrating an older Webpack-based Vue application to Vite, especially when the codebase has:

- Vue 2 that must stay in place for now
- server-rendered HTML or Pug templates
- custom dev-server middleware
- GraphQL file imports
- browser code that accidentally depends on Node globals
- Docker-based production builds

This document captures the practical lessons from the Wiki.js Webpack 4 to Vite migration so the next migration starts from a checklist instead of trial and error.

## Recommended target shape

- Keep Vue 2 temporarily, but move to a supported bridge:
  - `vite`
  - `@vitejs/plugin-vue2`
- Replace Webpack dev/build entrypoints with:
  - `vite.config.mjs`
  - `vite build`
  - Vite middleware mode for custom servers
- Replace bundler magic with explicit imports:
  - Prism plugins
  - CSS side effects
  - GraphQL loaders
  - browser-safe Base64/JWT helpers

## Pre-migration checklist

Before changing code, inventory these areas:

- Build entry files
- HTML generation path
- Dev middleware / HMR integration
- Alias rules
- File loaders
- GraphQL imports
- Vue runtime/compiler assumptions
- Browser code using `require`, `Buffer`, `global`, `process`, or Node-only libraries
- Dockerfiles and CI build commands

Search for these patterns early:

```bash
rg -n "webpack|html-webpack|hot-middleware|dev-middleware|Buffer\\.|\\bglobal\\b|jsonwebtoken|require\\(" .
```

## Main migration decisions

### 1. Keep Vue 2, but upgrade the bridge

If Vue 3 is not part of the same change, do not combine the framework upgrade with the bundler upgrade.

Use:

- `vue@2.7.x`
- `vue-template-compiler@2.7.x`
- `@vitejs/plugin-vue2`

This keeps the migration focused and reduces the number of moving parts.

### 2. Replace Webpack loaders/plugins with explicit Vite equivalents

Map old behavior directly:

- `*.gql` / `*.graphql`:
  - use `@rollup/plugin-graphql`
- `webpack-hot-middleware`:
  - replace with Vite middleware mode
- HtmlWebpack-based page generation:
  - replace with server-side asset manifest resolution
- Webpack auto-injected side effects:
  - replace with explicit imports in app code

### 3. Treat server-rendered HTML as a first-class migration concern

If the app does not use a single static `index.html`, do not try to force a typical SPA Vite pattern onto it.

Instead:

- let the server keep rendering HTML/Pug
- build client assets with Vite
- read `assets/manifest.json` in production
- inject Vite dev scripts in development

For apps with multiple entrypoints, define them explicitly in `rollupOptions.input`.

## High-risk areas and lessons learned

### Pug / HTML generation

Lesson:
Vite does not replace HtmlWebpackPugPlugin directly.

Recommended approach:

- generate pages on the server as before
- add a helper that returns:
  - dev scripts:
    - `/_assets/@vite/client`
    - entry module path
  - production scripts/styles from the Vite manifest

What to verify:

- all entrypoints exist in `manifest.json`
- styles are emitted and linked
- dev and prod paths both work

### Dev server integration

Lesson:
Vite HMR is not a drop-in replacement for `webpack-hot-middleware`.

Recommended approach:

- create a Vite server in middleware mode
- mount `vite.server.middlewares` in the existing Node/Express app
- let the existing backend continue to own routing and SSR

What to verify:

- backend routes still work
- `/_assets/@vite/client` loads in dev
- live edits trigger HMR or reloads

### Vue aliasing

Lesson:
Loose aliases can create broken rewritten paths or duplicate Vue instances.

Recommended approach:

- alias `vue` to the compiler-included ESM build using absolute paths
- add `resolve.dedupe = ['vue']`

What to verify:

- only one Vue build is loaded
- third-party packages like `vue-filepond` resolve correctly

### Browser-side Node dependencies

Lesson:
Webpack often masked invalid browser dependencies with polyfills. Vite makes these failures visible.

Common symptoms:

- `global is not defined`
- `Buffer is not defined`
- app HTML loads, but Vue never mounts

What caused trouble in this migration:

- `jsonwebtoken` imported in browser code just to decode JWT payloads
- `Buffer.from(..., 'base64')` used inside Vue components and stores

Recommended approach:

- do not use Node JWT libraries in browser code
- decode JWT payloads with simple Base64 parsing
- replace `Buffer` usage with browser-safe helpers such as `js-base64`

Search for:

```bash
rg -n "jsonwebtoken|Buffer\\.from\\(|\\bBuffer\\b|\\bglobal\\b" client
```

### Async editor chunks and browser-incompatible packages

Lesson:
A route can look "partially rendered" when the shell mounts but a lazy-loaded Vue component fails to import.

What happened here:

- the editor page header rendered
- the Markdown editor body stayed blank
- the real error was in the browser console:
  - `Failed to resolve async component`
  - `Module not found in bundle: ./types/bmp`
- the failing import chain came from `markdown-it-imsize` inside the editor-only client chunk

Why this matters:

- a dependency can still be valid on the server and invalid in the browser
- Vite surfaces the failure at the async chunk boundary, not always at app bootstrap
- if you only look at HTTP 200s and server logs, this looks like a mysterious blank area

Recommended approach:

- inspect the first failing async component in the browser console
- trace its import chain to the exact package causing the chunk failure
- if the package is only needed in browser code, replace it with a browser-safe local helper or alternate library
- if the same package is still needed on the server, keep the dependency until the server path is migrated too

What worked here:

- keep `markdown-it-imsize` for server-side rendering
- replace only the client/editor usage with a local ESM-safe image-size plugin

Search for:

```bash
rg -n "Failed to resolve async component|import\\(" client
rg -n "markdown-it-imsize|image-size" .
```

### Prism and build-time magic

Lesson:
If Webpack/Babel used plugins to inject runtime behavior, Vite will not reproduce that automatically.

What happened here:

- Prism plugins used to be wired through Babel plugin side effects
- after migration, the page rendered blank because the client crashed before mount

Recommended approach:

- import Prism plugins explicitly where needed
- import required plugin CSS explicitly

Examples of likely missing imports:

- autoloader
- line numbers
- normalize-whitespace
- toolbar
- toolbar CSS

### In-DOM Vue templates and slot parsing

Lesson:
Older server-rendered Vue 2 setups often rely on runtime parsing of custom DOM like:

```html
<page>
  <template slot="contents">...</template>
</page>
```

This is fragile during bundler migration.

Recommended approach:

- parse the server-rendered element explicitly during bootstrap
- mount the Vue component with a render function
- pass props and slot HTML intentionally

This removes a class of “HTML exists but app never mounts correctly” problems.

### GraphQL

Lesson:
GraphQL imports need an explicit bundler rule.

Recommended approach:

- add `@rollup/plugin-graphql`
- verify every client import path still resolves

### Dockerfiles

Lesson:
Production Dockerfiles often keep Webpack-era assumptions long after the app code is migrated.

What to check:

- build stage copies `vite.config.mjs`
- build command runs `vite build`
- production image copies `assets/`
- production image does not expect generated `server/views` artifacts from Webpack
- cleanup rules do not only target `webpack.config.js`
- optional registry and `NODE_ENV` build args are actually wired into the Dockerfile

Search for:

```bash
rg -n "webpack.config|server/views|vite.config|assets" dev -g 'Dockerfile'
```

## Migration sequence that worked well

1. Introduce `vite.config.mjs` with explicit entrypoints.
2. Replace the dev server wiring with Vite middleware mode.
3. Replace HtmlWebpack-based page generation with a manifest-backed helper.
4. Convert client entry files from `require()` patterns to ESM imports.
5. Replace loader/plugin behavior with explicit runtime imports.
6. Fix browser-incompatible Node usage.
7. Verify the actual browser page, not just the server logs.
8. Update Dockerfiles and production build paths last.

## Debugging order when the page is blank

Do not start with Sass warnings. They are noisy, but they are rarely the root cause.

Use this order:

1. Confirm server HTML is returned.
2. Confirm entry scripts are injected.
3. Check browser logs for first hard runtime error.
4. Verify whether `window.WIKI` exists.
5. Verify whether `.v-application` exists.
6. Search for Node globals or Node-only packages in browser code.
7. Search for missing side-effect imports previously supplied by Webpack/Babel.
8. If only part of a route is blank, inspect lazy-loaded component chunk failures next.

Strong signals:

- `window.WIKI === false`:
  - bootstrap failed before root mount
- HTML present but `page` tag untouched:
  - Vue never mounted
- `global is not defined`:
  - Node package leaked into browser bundle
- `Buffer is not defined`:
  - browser code still assumes Webpack polyfills
- `Failed to resolve async component`:
  - the route shell mounted, but a lazy-loaded child chunk failed
- `Module not found in bundle: ./types/...`:
  - a package inside a browser chunk is pulling incompatible Node/CommonJS internals

## Verification checklist

### Dev

- `npm run dev` starts cleanly enough to load the app
- server pages load with visible content
- browser console has no hard runtime errors
- HMR connects
- key routes render

### Production build

- `npm run build` succeeds
- `assets/manifest.json` is generated
- production server resolves all client assets from manifest
- Docker build copies the Vite output correctly

### Route-level smoke tests

At minimum, test:

- main page view
- setup page
- legacy page if still supported
- editor route
- history/source/admin routes if they decode server-provided Base64 props

## Follow-up cleanup after the migration works

Do this after stability, not before:

- sweep the rest of the client for `Buffer` usage
- sweep browser code for Node-only libraries
- audit lazy-loaded route components for server-only packages
- modernize Sass usage
- remove obsolete Webpack comments and package leftovers
- review docs and Docker comments for Webpack wording
- consider extracting repeated browser-safe helpers into shared client utilities

## Copy-paste checklist for the next project

```markdown
- Inventory Webpack plugins/loaders and map each one to:
  - Vite plugin
  - explicit import
  - server-side replacement
  - deletion
- Keep framework upgrade separate from bundler upgrade if possible
- Use Vite middleware mode for custom Node servers
- Replace HtmlWebpack page generation with manifest-backed asset injection
- Use absolute Vue aliases and dedupe Vue
- Search browser code for:
  - jsonwebtoken
  - Buffer
  - global
  - require()
- Replace build-time side effects with explicit imports
- Treat lazy-loaded route chunks as a separate debugging surface from app bootstrap
- If a dependency is valid on the server but breaks a client chunk, split the implementation instead of deleting the dependency immediately
- Verify in a real browser, not only from server logs
- Patch Dockerfiles after app code is stable
- Only then clean up warnings and docs
```

## Suggested future skill shape

If this is turned into a Codex skill later, the skill should trigger when the user asks to:

- migrate Webpack to Vite
- modernize a Vue 2 build without moving to Vue 3 yet
- replace HtmlWebpackPugPlugin-style asset injection
- debug blank pages after a Vite migration
- fix browser crashes caused by removed Webpack polyfills

The skill should include:

- this checklist
- a command-based audit section
- a browser-debugging section
- a Dockerfile audit section
- a final verification checklist
