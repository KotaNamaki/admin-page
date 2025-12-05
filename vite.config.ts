import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    build: {
      // added some build output changes
      outDir:'/home/motodivs/admin.motodiv.store/',
        emptyOutDir: true,
    }
})
