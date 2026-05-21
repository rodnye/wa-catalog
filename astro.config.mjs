// @ts-check
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import { defineConfig } from 'astro/config';

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || '/';
const PUBLIC_SITE = process.env.PUBLIC_SITE;

// https://astro.build/config
export default defineConfig({
  site: PUBLIC_SITE,
  integrations: [tailwind(), preact()],
  base: PUBLIC_BASE_URL,
  build: {
    assets: 'assets',
  },
  vite: {
    resolve: {
      alias: {
        '@/*': 'src/*',
      },
    },
  },
});
