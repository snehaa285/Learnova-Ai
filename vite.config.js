import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // THIS MUST BE EXACTLY YOUR GITHUB REPO NAME
  base: '/Learnova-Ai/', 
  plugins: [
    react(),
    tailwindcss(),
  ],
})