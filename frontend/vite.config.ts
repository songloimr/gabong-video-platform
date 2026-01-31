import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { vite as vidstack } from 'vidstack/plugins';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
    plugins: [vidstack(), tailwindcss(), sveltekit()],
    
    server: {
        allowedHosts: ["dev.khosachviet.online"]
    },
    
    build: {
        // Disable source maps in production
        sourcemap: mode === 'development',
        
        // Minification settings
        minify: 'esbuild',
        target: 'esnext',
        
        // Chunk size warnings
        chunkSizeWarningLimit: 500,
    },
    
    // Optimize dependencies for dev
    optimizeDeps: {
        include: ['hls.js'],
    },
}));
