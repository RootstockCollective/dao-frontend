import { createRequire } from 'module'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { config } from 'dotenv'

// Load the environment variables based on the profile
config({
  path: process.env.PROFILE ? `.env.${process.env.PROFILE}` : '.env',
})

// Load the endpoints defined in the src/lib/endpoints.ts file
const require = createRequire(import.meta.url)
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
  },
})
const endpoints = require('./src/lib/endpoints.ts')

// Define the proxy configurations
const corsBypassProxyConfig = () => ({
  target: process.env.NEXT_PUBLIC_PROXY_DESTINATION,
  changeOrigin: true,
  onProxyReq: proxyReq => {
    proxyReq.removeHeader('Origin')
    proxyReq.removeHeader('Referer')
    proxyReq.removeHeader('User-Agent')
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (compatible; AcmeBot/1.0)')
  },
  onProxyRes: proxyRes => {
    proxyRes.headers['Access-Control-Allow-Origin'] = window?.location?.host || 'http://localhost:3000'
  },
})

// Define the proxy configurations based on the network
const proxyConfigs = {
  testnet: corsBypassProxyConfig,
  regtest: undefined,
}

// We need NEXT_PUBLIC_RIF_WALLET_SERVICES to be an absolute URL, because it's used server side also
// hence for rewrites, we need to extract the pathname only.
const rifWalletServicesURL = new URL(process.env.NEXT_PUBLIC_RIF_WALLET_SERVICES || 'http://localhost:3000')

// Define the rewrites based on the network
const rewrites = {
  testnet: () => [
    {
      source: `${rifWalletServicesURL.pathname}/:path*`,
      destination: `${process.env.NEXT_PUBLIC_PROXY_DESTINATION}/:path*`,
    },
  ],
  regtest: () =>
    Object.entries(endpoints).map(([key, endpoint]) => ({
      source: `${rifWalletServicesURL.pathname}${endpoint}`.replace(/\{\{([^\}]+)\}\}/g, ':$1').split('?')[0],
      destination: `/api/mocks/${key}?path=:path*`,
    })),
}

// Define the proxy paths
const proxyPaths = ['/mock', '/cors_bypass']

// Define the network
const network = process.env.NEXT_PUBLIC_ENV

// Define the next configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  rewrites: rewrites[network],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.devServer = {
        ...config.devServer,
        before: app => {
          app.use(proxyPaths[network], createProxyMiddleware(proxyConfigs[network]))
        },
      }
    }
    return config
  },
}

export default nextConfig
