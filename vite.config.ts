import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Pin the dev port and FAIL loudly if it's taken, instead of silently
    // falling back to 5174 (which makes :5173 show whatever other Vite project
    // is squatting there). If you see "Port 5173 is already in use", another
    // dev server is on it — stop that one, or change this port.
    port: 5173,
    strictPort: true,
    // Bind on all interfaces (IPv4 0.0.0.0 + IPv6) so http://localhost:5173,
    // http://127.0.0.1:5173 and http://[::1]:5173 all reach THIS server.
    host: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
})
