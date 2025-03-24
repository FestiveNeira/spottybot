import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import copy from 'rollup-plugin-copy';

export default defineConfig({
	plugins: [sveltekit(), copy({
		targets: [
		  // { src: 'public/**/*', dest: '../src/desktop/resources' } // Uncomment if you need Svelte to build multiple locations
		]
	  })]
});
