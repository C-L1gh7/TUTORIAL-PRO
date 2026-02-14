import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 部署到 GitHub Pages 时，请取消下面的注释并将 'repo-name' 替换为你的仓库名称
  // base: '/repo-name/',
})
