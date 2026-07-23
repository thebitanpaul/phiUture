import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@data': path.resolve(__dirname, './src/data'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    // Manual vendor chunks apply to the CLIENT build only. During the SSG
    // (SSR) pass vite-react-ssg externalizes these deps, and rollup rejects
    // externals inside manualChunks — so we omit them there.
    rollupOptions: isSsrBuild
      ? {}
      : {
          output: {
            manualChunks: {
              framer: ['framer-motion'],
              router: ['react-router-dom'],
            },
          },
        },
  },
}))
