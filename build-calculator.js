const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

// Ensure the js directory exists
if (!fs.existsSync('./js')) {
  fs.mkdirSync('./js', { recursive: true });
}

console.log('Building standalone calculator...');

esbuild.build({
  entryPoints: ['components/RevenueCalculator.tsx'],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['es2015'],
  outfile: 'js/calculator.js',
  format: 'iife',
  globalName: 'RevenueCalculator',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.jsx': 'jsx',
    '.js': 'js',
    '.css': 'css',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.STANDALONE_CALCULATOR': 'true',
  },
  resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.css', '.json'],
  alias: {
    '@': path.resolve(__dirname),
  },
  external: ['react', 'react-dom', 'recharts'],
})
.then(() => {
  console.log('Standalone calculator built successfully!');
})
.catch((error) => {
  console.error('Error building calculator:', error);
  process.exit(1);
}); 