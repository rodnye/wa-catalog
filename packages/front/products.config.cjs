const dotenv = require('dotenv');
dotenv.config({ path: ['../../.env', '.env'] });

module.exports = {
  repo:
    'https://github.com/' + (process.env.PUBLIC_REPO || 'rodnye/wa-catalog'),
  branch: process.env.PUBLIC_REPO_BRANCH || 'root/data',
  mappings: [
    {
      include: ['src/data/categories.json'],
      dest: 'src/data/categories.json',
    },
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
