import { withSentryConfig } from '@sentry/nextjs'
import { config } from 'dotenv'

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

// Define the next configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
        ],
      },
    ]
  },
  experimental: {
    serverSourceMaps: true,
  },
  webpack: config => {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxInitialRequests: 2,
      maxAsyncRequests: 2,
    }

    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
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

  serverExternalPackages: ['knex', 'pino', 'pino-pretty'],
}

export default withSentryConfig(nextConfig, {
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

  org: process.env.SENTRY_ORG,

  project: process.env.SENTRY_PROJECT,

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
      // Automatically tree-shaking Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
})
