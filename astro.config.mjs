// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react'; // 1. IMPORT REACT
import icon from 'astro-icon';       // 2. IMPORT ICON

// https://astro.build/config
export default defineConfig({
  // 3. ADD THE INTEGRATIONS ARRAY
  integrations: [
    react(),
    icon()
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});