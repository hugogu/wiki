import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import graphql from '@rollup/plugin-graphql'

const ROOT_PATH = process.cwd()
const OUTPUT_PATH = path.join(ROOT_PATH, 'assets')
const VUE_ESM_PATH = path.join(ROOT_PATH, 'node_modules', 'vue', 'dist', 'vue.esm.js')

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    base: '/_assets/',
    publicDir: 'client/static',
    plugins: [
      graphql({
        include: ['**/*.gql', '**/*.graphql']
      }),
      vue({
        template: {
          transformAssetUrls: false,
          preprocessOptions: {
            doctype: 'html'
          }
        }
      })
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      'process.env.node_env': JSON.stringify(isProduction ? 'production' : 'development')
    },
    resolve: {
      dedupe: ['vue'],
      alias: [
        { find: 'vue/dist/vue.esm', replacement: VUE_ESM_PATH },
        { find: 'vue/dist/vue.esm.js', replacement: VUE_ESM_PATH },
        { find: 'vue/dist/vue.runtime.esm.js', replacement: VUE_ESM_PATH },
        { find: /^vue$/, replacement: VUE_ESM_PATH },
        { find: '@', replacement: path.join(ROOT_PATH, 'client') },
        { find: 'gql', replacement: path.join(ROOT_PATH, 'client', 'graph') },
        { find: 'apollo-link', replacement: path.join(ROOT_PATH, 'node_modules', 'apollo-link') },
        { find: 'apollo-utilities', replacement: path.join(ROOT_PATH, 'node_modules', 'apollo-utilities') },
        { find: 'uc.micro', replacement: path.join(ROOT_PATH, 'node_modules', 'uc.micro') }
      ]
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/scss/resources.scss" as *;',
          quietDeps: true
        }
      }
    },
    build: {
      outDir: OUTPUT_PATH,
      emptyOutDir: true,
      manifest: 'manifest.json',
      sourcemap: !isProduction,
      rollupOptions: {
        input: {
          app: path.join(ROOT_PATH, 'client', 'index-app.js'),
          legacy: path.join(ROOT_PATH, 'client', 'index-legacy.js'),
          setup: path.join(ROOT_PATH, 'client', 'index-setup.js')
        },
        output: {
          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const ext = path.extname(assetInfo.name || '').toLowerCase()

            if (ext === '.css') {
              return 'css/[name]-[hash][extname]'
            }
            if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
              return 'fonts/[name]-[hash][extname]'
            }
            if (ext === '.svg') {
              return 'svg/[name]-[hash][extname]'
            }
            if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico'].includes(ext)) {
              return 'img/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          }
        }
      }
    }
  }
})
