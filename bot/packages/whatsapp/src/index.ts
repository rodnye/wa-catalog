import dotenv from 'dotenv';
import { WhatsAppAdapter } from './adapter.js';
import { createServer } from './server.js';
import { BotEngine } from '@bot/core';

dotenv.config({ path: ['.env', '../../../.env'] });

async function main() {
  const authorizedNumbers = (process.env.AUTHORIZED_NUMBERS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const debounceMs = parseInt(process.env.DEBOUNCE_MS || '10000', 10);
  const baseUrl = process.env.BASE_PRODUCT_URL || 'https://lagitana.page.gd';
  const port = parseInt(process.env.PORT || '3000', 10);

  const githubToken = process.env.GITHUB_TOKEN;
  const githubRepo = process.env.GITHUB_REPO;
  const githubBranch = process.env.GITHUB_BRANCH || 'main';

  const allowedCurrencies = (process.env.ALLOWED_CURRENCIES || 'CUP,USD,EUR')
    .split(',')
    .map((s) => s.trim());

  if (!githubToken || !githubRepo) {
    console.error(
      'Missing GITHUB_TOKEN or GITHUB_REPO in environment variables.',
    );
    process.exit(1);
  }

  if (authorizedNumbers.length === 0) {
    console.warn(
      'WARNING: No AUTHORIZED_NUMBERS specified. The bot will not respond to anyone.',
    );
  }

  const adapter = new WhatsAppAdapter(authorizedNumbers);
  const engine = new BotEngine(
    adapter,
    githubToken,
    githubRepo,
    githubBranch,
    debounceMs,
    allowedCurrencies,
    baseUrl,
  );

  createServer(adapter, port);

  await engine.start();

  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await engine.stop();
    process.exit(0);
  });
}

main().catch(console.error);
