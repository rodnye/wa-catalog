module.exports = {
  repo:
    'https://github.com/' + (process.env.PUBLIC_REPO || 'rodnye/wa-catalog'),
  branch: process.env.PUBLIC_REPO_BRANCH || 'main',
  include: ['src/data/products/*.json'],
  target: 'src/data/products',
};
