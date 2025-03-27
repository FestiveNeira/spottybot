import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'rollup';
import copy from 'rollup-plugin-copy';
import css from 'rollup-plugin-css-only';
import del from 'rollup-plugin-delete';
import svelte from 'rollup-plugin-svelte';
import typescript from 'rollup-plugin-typescript2';
import { sveltePreprocess } from 'svelte-preprocess';

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
    chunkFileNames: '[name]-[hash].js', // Forces clear chunk names
  },
  plugins: [
    del({ targets: 'dist/frontend/*', runOnce: true }), // Clears the folder before building
    svelte({
      preprocess: sveltePreprocess({ sourceMap: true }),
      compilerOptions: {
        dev: true
      }
    }),
    css({
      // This was a fun little nightmare
      // For each .svelte file extract it's css to a separate file in the dist/frontend/build directory
      output: (styles, styleNodes) => {
        if (!fs.existsSync('dist/frontend/build')) {
          fs.mkdirSync('dist/frontend/build', { recursive: true });
        }
        for (const [srcpath, cssContent] of Object.entries(styleNodes)) {
          const srcfile = path.parse(srcpath);
          const filePath = path.join(`${srcpath}`, '../../../../dist/frontend/build', srcfile.base);
          fs.writeFileSync(filePath, cssContent);
          console.log(`✅ CSS extracted: ${filePath}`);
        }
      },
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