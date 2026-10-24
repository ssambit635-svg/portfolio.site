import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Relative base so the same build works on GitHub Pages project sites
 * (https://user.github.io/portfolio.site/), custom domains and Docker/Nginx.
 */
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    // Dev servers in this sandbox are proxied through a generated host.
    allowedHosts: true
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: true
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      // Three real pages: the landing page, the certificates dashboard and the one-page CV.
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        dashboard: fileURLToPath(new URL('./dashboard/index.html', import.meta.url)),
        cv: fileURLToPath(new URL('./cv/index.html', import.meta.url))
      }
    }
  }
})
