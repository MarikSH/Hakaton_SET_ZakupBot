import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Procurement Tracker',
        short_name: 'ProcTrack',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }]
      }
    })
  ]
})
