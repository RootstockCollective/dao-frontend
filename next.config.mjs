import { withSentryConfig } from '@sentry/nextjs'
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
    console.warn('⚠️  NEXT_PUBLIC_PROXY_DESTINATION is not set. CORS bypass proxy will be disabled.')
    return null
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
    const proxyConfig = corsBypassProxyConfig()
    return {
      ...nextConfig,
      rewrites: corsBypassRewrite,
      webpack: (config, options) => {
        if (options.isServer) {
          return config
        }
        // Only add proxy middleware if config is valid
        if (!proxyConfig) {
          return nextConfig.webpack(config, options)
        }
        const devServer = {
          ...config.devServer,
          before: app => {
            app.use('/cors_bypass', createProxyMiddleware(proxyConfig))
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

export default withSentryConfig(exportedNextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options
  //
  // NOTE: These values are REQUIRED for builds (source map upload) even if the Sentry
  // feature flag (NEXT_PUBLIC_ENABLE_FEATURE_SENTRY_ERROR_TRACKING) is disabled.
  // The feature flag only controls runtime error tracking, not build-time source map uploads.
  // Set these in your .env files:
  // - SENTRY_ORG: Your Sentry organization slug
  // - SENTRY_PROJECT: Your Sentry project name
  // - SENTRY_AUTH_TOKEN: Your Sentry auth token (keep this secret, do not commit to repo)

  org: process.env.SENTRY_ORG || 'rootstocklabs',

  project: process.env.SENTRY_PROJECT || 'javascript-nextjs',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
})
