/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  modularizeImports: {
    'react-icons': {
      transform: 'react-icons/{{member}}',
    },
  },
}

export default nextConfig
