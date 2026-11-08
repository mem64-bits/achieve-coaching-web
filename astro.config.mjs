// @ts-check
import {defineConfig, envField} from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import icon from 'astro-icon';
import compress from 'astro-compress';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
    site: 'https://www.achievecoaching.net',

    integrations: [react(), icon(), compress({
        CSS: false,
        Image: false,
        HTML: false,
        SVG: true,
        Logger: 1,
    }), sitemap()],

    env: {
        schema: {
            RESEND_API_KEY: envField.string({context: 'server', access: 'secret', optional: true}),
            NOTIFICATION_EMAIL: envField.string({
                context: 'server',
                access: 'secret',
                default: 'bobby@achievecoaching.net',
            }),
        },
    },

    vite: {
        plugins: [tailwindcss()],
        build: {
            cssMinify: 'lightningcss',
        },
        // Dev server only. Swiper is reached through the photo viewer's lazy
        // import, so Vite would find it late, re-bundle it and leave the open
        // page asking for a stale copy (a 504 and a viewer that won't open).
        // Bundling it up front avoids that.
        optimizeDeps: {
            include: ['swiper/react', 'swiper/modules'],
        },
    },

    adapter: vercel()
});
