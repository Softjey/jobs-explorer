import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const apiProxy = {
  '/api': {
    target: 'https://www.coople.com',
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/api/, '/ch/resources/api'),
  },
}

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: 'src/routes',
      generatedRouteTree: 'src/routeTree.gen.ts',
    }),
    react(),
    tailwindcss(),
  ],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
  test: {
    globals: true,
    env: { VITE_API_BASE_URL: '/api' },
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/api/**', 'src/store/**', 'src/entities/**', 'src/lib/**'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/index.ts'],
      thresholds: { lines: 90, branches: 90 },
    },
  },
})
