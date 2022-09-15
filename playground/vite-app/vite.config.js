import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      hot: {
        partialAccept: true,
      },
    }),
  ],
  experimental: {
    hmrPartialAccept: true,
  },
})
