import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  // 相对资源路径：构建产物既可部署到子路径，也可用 file:// 双击直接打开
  base: './',
  plugins: [
    react(),
    // 单文件产物：全部 JS/CSS 内联进 dist/index.html（file:// 下外链 ES Module 会被浏览器拦截）
    viteSingleFile(),
  ],
  build: {
    rollupOptions: {
      output: {
        // 禁用代码分割，确保懒加载页面也内联进同一个 HTML
        inlineDynamicImports: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
