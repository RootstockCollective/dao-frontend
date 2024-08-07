/** @type {import('next').NextConfig} */
import { createProxyMiddleware } from 'http-proxy-middleware'

const nextConfig = {
  output: 'standalone',
  rewrites: () => [
    {
      source: `${process.env.NEXT_PUBLIC_RIF_WALLET_SERVICES}/:path*`,
      destination: `${process.env.NEXT_PUBLIC_PROXY_DESTINATION}/:path*`,
    },
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.devServer = {
        ...config.devServer,
        before: app => {
          app.use(
            '/cors_bypass',
            createProxyMiddleware({
              target: process.env.NEXT_PUBLIC_PROXY_DESTINATION,
              changeOrigin: true,
              onProxyReq: proxyReq => {
                proxyReq.removeHeader('Origin')
                proxyReq.removeHeader('Referer')
                proxyReq.removeHeader('User-Agent')
                proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (compatible; AcmeBot/1.0)')
              },
              onProxyRes: proxyRes => {
                proxyRes.headers['Access-Control-Allow-Origin'] =
                  window?.location?.host || 'http://localhost:3000'
              },
            }),
          )
        },
      }
    }
    return config
  },
}

export default nextConfig
