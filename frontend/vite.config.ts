import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ],
  server: {
    host: true, // Tells Vite to listen on 0.0.0.0
    port: 5173, // Ensure the port is explicitly set
    strictPort: true, // Fail if port 5173 is taken, rather than randomly assigning another
  }
})
