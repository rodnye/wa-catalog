// @ts-check
import tailwindIntegration from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';
import path from 'node:path';

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || '/';
const PUBLIC_SITE = process.env.PUBLIC_SITE;

// https://astro.build/config
export default defineConfig({
  site: PUBLIC_SITE,
  integrations: [tailwindIntegration()],
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
