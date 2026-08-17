import { IChannelAdapter, IncomingMessage } from '@bot/types';
import { StateMachine } from './state-machine.js';
import { GitHubService } from './github.js';

export class BotEngine {
  private adapter: IChannelAdapter;
  private machine: StateMachine;

  constructor(
    adapter: IChannelAdapter,
    githubToken: string,
    githubRepo: string,
    githubBranch: string,
    debounceMs: number,
    allowedCurrencies: string[],
    baseUrl: string,
  ) {
    this.adapter = adapter;
    const github = new GitHubService(
      githubToken,
      githubRepo,
      githubBranch,
      adapter.userAgent,
    );
    this.machine = new StateMachine(
      github,
      debounceMs,
      allowedCurrencies,
      baseUrl,
    );
  }

  async start() {
    this.adapter.onMessage(async (msg: IncomingMessage) => {
      if (!this.adapter.isAuthorized(msg.senderId)) {
        console.log(`Unauthorized access attempt from ${msg.senderId}`);
        return;
      }

      try {
        await this.machine.handleMessage(
          msg,
          async (text: string, replyTo?: IncomingMessage) => {
            await this.adapter.sendText(msg.chatId, text, replyTo);
          },
        );
      } catch (err) {
        console.error('Error processing message:', err);
        await this.adapter.sendText(
          msg.chatId,
          '❌ Ocurrió un error procesando tu mensaje.',
        );
      }
    });

    await this.adapter.start();
    console.log('Bot Engine started successfully.');
  }

  async stop() {
    await this.adapter.stop();
  }
}
