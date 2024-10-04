/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (
    config
  ) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxInitialRequests: 2, // Limit the number of requests on initial page load
      maxAsyncRequests: 2, // Limit the number of requests when loading dynamically imported modules
    }
    return config
  },
}

export default nextConfig
