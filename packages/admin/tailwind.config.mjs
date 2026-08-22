import globalConfig from '@catalog/shared/src/styles/tailwind.config.mjs';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [globalConfig],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
};