/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // This will generate static HTML/CSS/JS
  images: {
    unoptimized: true // Required for static export
  },
  // Ensure we can still use the calculator route
  basePath: '',
  trailingSlash: true,
  env: {
    BUILD_ID: new Date().getTime().toString(),  // Force new build each time
  },
}

module.exports = nextConfig 