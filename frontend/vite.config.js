import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    host: true, // Allow external access
    hmr: {
      clientPort: 443, // Force HMR to use the Caddy port
    },
  },
})