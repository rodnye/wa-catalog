const { loadEnvFile } = require('node:process');

try {
  loadEnvFile('./.env');
} catch {}

module.exports = {
  repo:
    'https://github.com/' + (process.env.PUBLIC_REPO || 'rodnye/wa-catalog'),
  branch: process.env.PUBLIC_REPO_BRANCH || 'data/demo',
  mappings: [
    {
      include: ['src/data/products/*.json'],
      dest: 'src/data/products/',
    },
    {
      include: ['public/images/*'],
      dest: 'public/images/',
    },
  ],
};
