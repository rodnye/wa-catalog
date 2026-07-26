import { IChannelAdapter, IncomingMessage } from '@bot/types';

export class TelegramAdapter implements IChannelAdapter {
  public readonly userAgent = 'Telegram Bot';
  async start(): Promise<void> {
    console.log('Telegram adapter started (Placeholder).');
  }

  async stop(): Promise<void> {
    console.log('Telegram adapter stopped.');
  }

  async sendText(
    chatId: string,
    text: string,
    replyToMessage?: IncomingMessage,
  ): Promise<void> {
    console.log(`[Telegram] Sending to ${chatId}: ${text}`);
  }

  getLatestQR(): string | null {
    return null;
  }

  onMessage(callback: (msg: IncomingMessage) => void): void {
    // Placeholder for Telegram message listener
  }

  isAuthorized(senderId: string): boolean {
    return true;
  }
}
