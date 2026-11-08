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
        // Dev server only. Bundle Swiper up front: when Vite discovers it late
        // (the viewer's lazy import), it re-bundles it and the open page asks
        // for a stale copy (a 504 and a viewer that won't open).
        optimizeDeps: {
            include: ['swiper/react', 'swiper/modules'],
        },
    },

    adapter: vercel()
});
