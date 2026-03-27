import { build } from 'esbuild';
import { glob } from 'glob';
import { statSync } from 'fs';
import path from 'path';
import { BUILD_CONFIG } from './utils/config.js';

async function buildCSS() {
  const cssFiles = await glob(BUILD_CONFIG.cssPattern, {
    cwd: BUILD_CONFIG.sourceDir,
    ignore: BUILD_CONFIG.exclude,
  });

  if (cssFiles.length === 0) {
    console.log('No CSS files found.');
    return 0;
  }

  console.log(`Found ${cssFiles.length} CSS files to minify`);

  let totalOriginal = 0;
  let totalMinified = 0;

  for (const file of cssFiles) {
    const inputPath = path.join(BUILD_CONFIG.sourceDir, file);
    const outputPath = inputPath.replace(/\.css$/, '.min.css');

    const originalSize = statSync(inputPath).size;

    await build({
      entryPoints: [inputPath],
      outfile: outputPath,
      bundle: false,
      minify: true,
      loader: { '.css': 'css' },
    });

    const minifiedSize = statSync(outputPath).size;
    const reduction = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

    totalOriginal += originalSize;
    totalMinified += minifiedSize;

    console.log(
      `  ${file}: ${(originalSize / 1024).toFixed(1)}KB → ${(minifiedSize / 1024).toFixed(1)}KB (${reduction}% reduction)`
    );
  }

  const totalReduction = ((1 - totalMinified / totalOriginal) * 100).toFixed(1);
  console.log(
    `\nCSS total: ${(totalOriginal / 1024).toFixed(1)}KB → ${(totalMinified / 1024).toFixed(1)}KB (${totalReduction}% reduction)`
  );

  return totalOriginal - totalMinified;
}

buildCSS().catch(error => {
  console.error('CSS build failed:', error.message);
  process.exit(1);
});
