import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: ['qrcode.react'], // Exclude qrcode.react from being optimized
  },
  plugins: [react(), tailwindcss(),],
  // server: {
  //   host: '0.0.0.0', // Allows access from other devices
  //   port: 5173, // Specify the port
  // },
})
