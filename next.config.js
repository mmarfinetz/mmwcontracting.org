/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // This will generate static HTML/CSS/JS
  distDir: 'public', // This sets the output directory to 'public'
  images: {
    unoptimized: true // Required for static export
  },
  // Ensure we can still use the calculator route
  basePath: '',
  trailingSlash: true,
}

module.exports = nextConfig 