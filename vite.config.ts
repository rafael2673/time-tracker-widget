import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    vue({
      customElement: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'TimeTrackerWidget',
      fileName: 'time-tracker-widget'
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  },
  define: {
    'process.env': {}
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src')
    }
  }
})