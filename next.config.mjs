/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    loader: 'imgix',
    path: '/'
  }
}

export default nextConfig
