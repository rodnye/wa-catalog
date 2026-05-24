// @ts-check
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || '/';
const PUBLIC_SITE = process.env.PUBLIC_SITE;

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), preact()],
  site: PUBLIC_SITE || 'http://0.0.0.0',
  base: PUBLIC_BASE_URL || '/',

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

  adapter: cloudflare(),
});