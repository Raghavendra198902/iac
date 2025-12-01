import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  
  // Production optimizations
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
          'utils': ['axios', 'date-fns', 'zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: mode === 'production' ? false : true,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },

  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@vite/client', '@vite/env'],
  },

  // Server configuration
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path,
      },
      '/socket.io': {
        target: process.env.VITE_WS_URL || 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
    },
    hmr: {
      overlay: mode === 'development',
    },
  },

  // Preview server (for production builds)
  preview: {
    port: 4173,
    strictPort: true,
    host: '0.0.0.0',
  },

  // Environment variables
  envPrefix: 'VITE_',

  // CSS configuration
  css: {
    devSourcemap: mode === 'development',
    preprocessorOptions: {
      css: {
        charset: false,
      },
    },
  },
}))
