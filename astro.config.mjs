// @ts-check
import tailwindIntegration from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  base: process.env.BASE_URL || '/',
  integrations: [tailwindIntegration()],
  adapter: cloudflare(),
});