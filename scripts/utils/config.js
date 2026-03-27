import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

export const BUILD_CONFIG = {
  sourceDir: path.join(rootDir, 'assets'),
  outputDir: path.join(rootDir, 'assets'),

  jsPattern: '*.js',
  cssPattern: '*.css',

  // Files to skip — already minified or third-party
  exclude: ['*.min.js', '*.min.css', '*.map', 'popover-polyfill.js', 'qr-code-generator.js'],

  esbuild: {
    minify: true,
    format: 'esm',
    target: 'es2020',
    sourcemap: false,
  },
};
