// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

import icon from 'astro-icon';

import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  site: "https://kaptcha0.github.io",
  integrations: [mdx(), icon(), svelte()],

  vite: {
    plugins: [tailwindcss()]
  }
});