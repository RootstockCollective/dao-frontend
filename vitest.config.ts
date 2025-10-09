import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    env: {
      NEXT_PUBLIC_ENV: 'testnet',
      NEXT_PUBLIC_CHAIN_ID: '31',
      NEXT_PUBLIC_RIF_ADDRESS: '0x0000000000000000000000000000000000000000',
      NEXT_PUBLIC_STRIF_ADDRESS: '0x0000000000000000000000000000000000000001',
      NEXT_PUBLIC_USDRIF_ADDRESS: '0x0000000000000000000000000000000000000002',
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
