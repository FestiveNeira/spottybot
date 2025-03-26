import svelte from 'rollup-plugin-svelte';
import { defineConfig } from 'rollup';
import { sveltePreprocess } from 'svelte-preprocess';
import css from 'rollup-plugin-css-only';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

export default defineConfig({
  input: 'src/frontend/main.ts',  // Entry file for Svelte
  output: {
    sourcemap: true,
    format: 'iife',  // Immediately-invoked function expression (for browsers)
    name: 'app',
    file: 'dist/frontend/build/bundle.js', // Output file
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess({ sourceMap: true }),
      compilerOptions: {
        dev: true,
      },
    }),
    css({ output: 'bundle.css' }),
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