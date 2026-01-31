import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		
		// Version for cache busting
		// version: {
		// 	name: process.env.npm_package_version || '0.0.1',
		// },
	},
	
	// Compiler options
	compilerOptions: {
		// Disable dev mode features in production
		dev: process.env.NODE_ENV !== 'production',
	},
};

export default config;
