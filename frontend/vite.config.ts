import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true
      },
      protocolImports: true,
      include: ['crypto', 'buffer', 'stream', 'util']
    }),
    vue()
  ],
  build: {
    target: 'es2015',
    minify: false
  },
  define: {
    'process.env': {},
    global: {}
  }
})
