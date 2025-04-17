import { svelte } from '@sveltejs/vite-plugin-svelte'
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite'

// Dynamically find all .ts entry files in the frontend folder
const entryPoints = fs.readdirSync('./src/frontend/pages')
  .filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts'))
  .reduce<Record<string, string>>((entries, file) => {
    const name = path.parse(file).name;
    entries[name] = `src/frontend/pages/${file}`;
    return entries;
  }, {});

console.log(entryPoints);

// Custom Vite plugin to generate virtual html files from out .ts entry points using the passed html file as a base (cool as hell)
function virtualHtmlPlugin(template: string): Plugin {
  return {
    name: 'virtual-html',
    enforce: 'pre',
    // Tell Vite that our HTML files exist (virtually)
    resolveId(source: string) {
      return source.endsWith('.html') ? source : null;
    },
    // Generate the HTML content when Vite requests it
    load(id: string) {
      let name = path.parse(id).name;
      let ext = path.parse(id).ext;
      if (entryPoints[name] && ext === '.html') {
        const file = fs.readFileSync(template, 'utf-8');
        return file
          .replace(/{{title}}/g, `Page ${name}`)
          .replace(/{{entry}}/g, entryPoints[name]);
      }
      return null;
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    svelte({ configFile: 'svelte.config.js' }),
    virtualHtmlPlugin('src/frontend/template.html'),
  ],
  build: {
    outDir: 'dist/frontend',
    assetsDir: 'assets',
    rollupOptions: {
      input: Object.keys(entryPoints).reduce((input: Record<string, string>, page) => {
        input[page] = `${page}.html`; // Tell Vite to treat each .ts file as an .html entry point
        return input;
      }, {}),
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
})
