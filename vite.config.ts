import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib')
		}
	},
	server: {
		fs: {
			allow: ['.']
		},
		host: true, // This enables listening on all addresses
		proxy: {}, // Empty proxy config to ensure proper host detection
		strictPort: false // Allow fallback to another port if needed
	}
});
