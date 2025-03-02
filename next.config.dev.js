/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development configuration
  reactStrictMode: true,
  swcMinify: false,
  env: {
    BUILD_ID: new Date().getTime().toString(),
    IS_NEXT_APP: 'true',
    STANDALONE_CALCULATOR: 'false',
  },
}

module.exports = nextConfig
