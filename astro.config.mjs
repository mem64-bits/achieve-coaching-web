// @ts-check
import {defineConfig} from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import icon from 'astro-icon';
import compress from 'astro-compress';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
    integrations: [react(), icon(), compress({
        CSS: false,
        Image: false,
        HTML: true,
        SVG: true,
        Logger: 1,
    }), sitemap()],
    vite: {
        plugins: [tailwindcss()],
        build: {
            minify: 'esbuild',
            cssMinify: 'lightningcss',
        },
        esbuild: {
            drop: ['console', 'debugger'],
            legalComments: 'none',
        }
    }
});