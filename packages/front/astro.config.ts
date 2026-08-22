// @ts-check
import preact from '@astrojs/preact';
import { defineConfig } from 'astro/config';
import dotenv from 'dotenv';
import path from 'path';
import { copy, ensureDir } from 'fs-extra';
import Icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
const __dirname = import.meta.dirname;

dotenv.config({ path: ['../../.env', '.env'] });

const isDev = process.env.NODE_ENV !== 'production';

const BASE_URL = process.env.PUBLIC_BASE_URL || '/';
const SITE = process.env.PUBLIC_SITE || 'http://0.0.0.0';

// https://astro.build/config
export default defineConfig({
  integrations: [
    preact(),
    {
      name: 'post-build-actions',
      hooks: {
        async 'astro:build:done'() {
          if (isDev) return;

          const adminDir = path.resolve(__dirname, '../admin');
          const adminDist = path.join(adminDir, 'dist');
          const destDir = path.join(__dirname, 'dist');
          console.log(adminDir, adminDist, destDir);
          try {
            await ensureDir(destDir);
            await copy(adminDist, destDir, { overwrite: true });
          } catch (error) {
            console.error('astro post-build error:', error);
          }
        },
      },
    },
  ],

  site: SITE,
  base: BASE_URL,
  build: {
    assets: 'assets',
  },
  vite: {
    plugins: [
      Icons({
        compiler: 'jsx',
        jsx: 'preact',
        customCollections: {
          assets: FileSystemIconLoader('./src/assets'),
        },
      }) as any,
    ],
    resolve: {
      alias: {
        '@/*': 'src/*',
      },
    },
  },
});
