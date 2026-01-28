import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { vite as vidstack } from 'vidstack/plugins';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [vidstack(), tailwindcss(), sveltekit()],
    server: {
        allowedHosts: [
            "dev.khosachviet.online"
        ]
    }
});
