import svelte from 'rollup-plugin-svelte';
import { defineConfig } from 'rollup';
import { sveltePreprocess } from 'svelte-preprocess';
import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy';
import fs from 'fs';
import path from 'path';

// Dynamically find all .ts entry files in the frontend folder
const entryPoints = fs.readdirSync('src/frontend/pages')
  .filter(file => file.endsWith('.ts')) // Get only .ts files
  .reduce((entries, file) => {
    const name = path.parse(file).name;
    entries[name] = `src/frontend/pages/${file}`;
    return entries;
  }, {});

export default defineConfig({
  input: entryPoints,  // Entry file for Svelte
  output: {
    sourcemap: true,
    format: 'esm',
    dir: 'dist/frontend/build', // Output location
    entryFileNames: '[name].js', // Output file name
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess({ sourceMap: true }),
      compilerOptions: {
        dev: true,
      },
      emitCss: true,  // ✅ Enables per-component CSS output
    }),
    postcss({
      extract: true,  // ✅ Extracts CSS into separate files
      inject: false,  // Prevents injecting styles into JS
    }),
    copy({
      targets: [
        { src: ['src/frontend/pages/*.html', 'src/frontend/global/**/*'], dest: 'dist/frontend' }, // Copy HTML files
      ]
    }),
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),
    typescript({
      sourceMap: true,
      tsconfig: 'src/frontend/tsconfig.json', // point to your frontend tsconfig.json
    }),
  ],
  onwarn(warning, warn) {
    // Suppress circular dependency warnings specific to Svelte
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      let isSvelte = true;
      warning.ids.forEach(id => {
        if (!id.includes("svelte")) {
          isSvelte = false;
        }
      });
      if (isSvelte) return;
    }
    warn(warning); // Default behavior for other warnings
  },
});