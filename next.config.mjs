import { config } from 'dotenv'
import { createProxyMiddleware } from 'http-proxy-middleware'

// Load the environment variables based on the profile
// Handle case where PROFILE might already include .env prefix
const profile = process.env.PROFILE || ''
const envPath = profile.startsWith('.env.') ? profile : profile ? `.env.${profile}` : '.env'

config({
  path: ['apis.conf', envPath],
  override: true, // Override existing environment variables
})

// Debug: Log which env file is being loaded (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log(`📁 Loading environment from: ${envPath} (PROFILE: ${profile || 'not set'})`)
}

const isCorsBypassAllowed = process.env.NEXT_PUBLIC_ENABLE_CORS_BYPASS == 'true' ?? false

// Define the proxy configurations
const corsBypassProxyConfig = () => {
  if (!process.env.NEXT_PUBLIC_PROXY_DESTINATION) {
    throw new Error('NEXT_PUBLIC_PROXY_DESTINATION is required when CORS bypass is enabled')
  }

  return {
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
  }
}

// We need NEXT_PUBLIC_RIF_WALLET_SERVICES to be an absolute URL, because it's used server side also
// hence for rewrites, we need to extract the pathname only.
const rifWalletServicesURL = new URL(process.env.NEXT_PUBLIC_RIF_WALLET_SERVICES || 'http://localhost:3000')
const corsBypassRewrite = () => {
  // Validate required environment variables
  if (!process.env.NEXT_PUBLIC_PROXY_DESTINATION) {
    console.warn('⚠️  NEXT_PUBLIC_PROXY_DESTINATION is not set. CORS bypass rewrites will be disabled.')
    console.warn(`   Current PROFILE: ${profile || 'not set'}, Env file: ${envPath}`)
    return []
  }

  // Handle empty pathname (when URL is just the base, pathname is '/')
  const pathname = rifWalletServicesURL.pathname === '/' ? '' : rifWalletServicesURL.pathname

  return [
    {
      source: `${pathname}/:path*`,
      destination: `${process.env.NEXT_PUBLIC_PROXY_DESTINATION}/:path*`,
    },
  ]
}

// Define the next configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: config => {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxInitialRequests: 2, // Limit the number of requests on initial page load
      maxAsyncRequests: 2, // Limit the number of requests when loading dynamically imported modules
    }

    return config
  },
  turbopack: {},
  images: {
    remotePatterns: [
      {
        hostname: 'red-legislative-meadowlark-461.mypinata.cloud',
      },
    ],
  },

  serverExternalPackages: ['knex'],
}

const getNextConfig = () => {
  if (isCorsBypassAllowed) {
    return {
      ...nextConfig,
      rewrites: corsBypassRewrite,
      webpack: (config, options) => {
        if (options.isServer) {
          return config
        }
        const devServer = {
          ...config.devServer,
          before: app => {
            app.use('/cors_bypass', createProxyMiddleware(corsBypassProxyConfig))
          },
        }

        return {
          ...nextConfig.webpack(config, options),
          devServer,
        }
      },
    }
  }

  return nextConfig
}

const exportedNextConfig = getNextConfig()

export default exportedNextConfig
