/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    loader: 'imgix',
    path: '/'
  }
}

export default nextConfig
