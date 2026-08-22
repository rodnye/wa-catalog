import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import preact from '@preact/preset-vite';
import Icons from 'unplugin-icons/vite';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'node:path';

dotenv.config({ path: ['../../.env', '.env'] });

const isDev = process.env.NODE_ENV !== 'production';

//
// Si se esta en desarrollo se asume que se usara la direccion root de esta carpeta
// Si se esta en produccion, se asume que estara junto con el front/ en la subcarpeta /admin/v2
//
const BASE_URL = isDev ? '/' : (process.env.PUBLIC_BASE_URL || '/');
const ADMIN_URL = isDev ? '/' : '/admin/v2';

export default defineConfig({
  base: path.join(BASE_URL, ADMIN_URL),
  envPrefix: 'PUBLIC_', //
  build: {
    outDir: path.join('./dist', ADMIN_URL),
  },

  plugins: [
    preact(),
    Icons({
      compiler: 'jsx',
      jsx: 'preact',
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
