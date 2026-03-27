import { execSync } from 'child_process';

const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  console.log('Skipping build — set NODE_ENV=production to run.');
  console.log('Example: npm run build');
  process.exit(0);
}

console.log('Starting production build...\n');

try {
  console.log('Building CSS...');
  execSync('node scripts/build-css.js', { stdio: 'inherit' });

  console.log('\nBuilding JavaScript...');
  execSync('node scripts/build-js.js', { stdio: 'inherit' });

  console.log('\nBuild complete.');
} catch (error) {
  console.error('\nBuild failed:', error.message);
  process.exit(1);
}
