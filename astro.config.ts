// @ts-check
import preact from '@astrojs/preact';
import { defineConfig } from 'astro/config';
import Icons from 'unplugin-icons/vite';
import type { Options } from 'unplugin-icons';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || '/';
const PUBLIC_SITE = process.env.PUBLIC_SITE;

const customCollections: Options['customCollections'] = {
  assets: FileSystemIconLoader('./src/assets'),
};

// https://astro.build/config
export default defineConfig({
  integrations: [preact()],

  site: PUBLIC_SITE || 'http://0.0.0.0',
  base: PUBLIC_BASE_URL || '/',
  build: {
    assets: 'assets',
  },
  vite: {
    plugins: [
      Icons({
        compiler: 'jsx',
        jsx: 'preact',
        customCollections,
      }),
    ],
    resolve: {
      alias: {
        '@/*': 'src/*',
      },
    },
  },
});
