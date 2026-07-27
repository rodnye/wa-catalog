import { createClient, WhatsmeowClient } from '@whatsmeow-node/whatsmeow-node';
import { IChannelAdapter, IncomingMessage } from '@bot/types';
import { writeFile, mkdir, appendFile, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';
import { setTimeout } from 'timers/promises';

export class WhatsAppAdapter implements IChannelAdapter {
  public readonly userAgent = 'Whatsapp Bot';
  private client: WhatsmeowClient;
  private authorizedNumbers: string[];
  private messageCallback?: (msg: IncomingMessage) => Promise<void>;
  private latestQR: string | null = null;
  private mediaDir: string;
  private messagesTail = [] as unknown as IncomingMessage[] & {
    processing: boolean;
  };
  private currentChatId: string | null = null;
  private timeoutIdByAfk: NodeJS.Timeout | null = null;

  async processTail(): Promise<void> {
    if (!this.messageCallback) return;
    const currentMessage = this.messagesTail.shift();

    if (!currentMessage) {
      // tail empty, end
      this.messagesTail.processing = false;
      return;
    }

    // cancelar afk e iniciar temporizador de afk
    if (this.timeoutIdByAfk) global.clearTimeout(this.timeoutIdByAfk);
    this.timeoutIdByAfk = global.setTimeout(
      () => {
        this.currentChatId = null;
      },
      1000 * 60 * 5,
    );

    // esta dentro del mismo chat el nuevo mensaje
    const alreadyChat = currentMessage.chatId === this.currentChatId;

    if (!alreadyChat) {
      // human timeout para finjir cambio de chat
      await setTimeout(1000 + Math.random() * 3000);
      this.currentChatId = currentMessage.chatId;

      let listToRead = [currentMessage.id];
      let step = 0;

      while (this.messagesTail[step]?.chatId === currentMessage.chatId) {
        listToRead.push(this.messagesTail[step].chatId);
        step++;
      }

      await this.client.markRead(
        listToRead,
        currentMessage.chatId,
        currentMessage.senderId,
      );
    }

    if (currentMessage.mediaType && currentMessage.rawMessage) {
      try {
        const tempPath = await this.client.downloadAny(
          currentMessage.rawMessage,
        );
        const ext = extname(tempPath) || '.jpg';
        const finalPath = join(this.mediaDir, `${currentMessage.id}${ext}`);

        const buffer = await readFile(tempPath);
        await writeFile(finalPath, buffer);
        currentMessage.mediaPath = finalPath;
      } catch (err) {
        console.error('Error downloading media:', err);
      }
    }

    // aplicar la logica del core
    await this.messageCallback(currentMessage);

    // continuar procesamiento de la cola
    return this.processTail();
  }

  async handleIncomingMessage(msg: IncomingMessage) {
    if (msg.chatId === this.currentChatId) {
      // ya estabas dentro del chat, leer.
      // ... Esto se hace aqui debido a que aunque estes procesando otro mensaje,
      // ... whatsapp marca que se leyo el mensaje
      await this.client.markRead([msg.id], msg.chatId, msg.senderId);
    }

    // encolar
    this.messagesTail.push(msg);

    if (this.messagesTail.processing) return;
    this.messagesTail.processing = true;
    return this.processTail();
  }

  constructor(authorizedNumbers: string[]) {
    this.authorizedNumbers = authorizedNumbers.map((n) => n.replace(/\D/g, ''));
    this.client = createClient({ store: 'session.db' });
    this.mediaDir = join(process.cwd(), 'temp_media');
    if (!existsSync(this.mediaDir)) {
      mkdir(this.mediaDir, { recursive: true });
    }
  }

  async start(): Promise<void> {
    this.client.on('qr', ({ code }) => {
      this.latestQR = code;
      console.log('New QR Code generated. Access /auth/qr to view it.');
    });

    this.client.on('connected', ({ jid }) => {
      console.log(`Connected to WhatsApp as ${jid}`);
      this.client.sendPresence('available');
      this.latestQR = null;
    });

    this.client.on('message', async (a) => {
      const { info, message } = a;

      await appendFile(
        'messages.log',
        '\n\n--- ' +
          new Date().toISOString() +
          '\n\n' +
          JSON.stringify(info) +
          JSON.stringify(message),
      );

      if (info.isFromMe) return;

      let mediaPath: string | undefined;
      let mediaType: 'image' | 'video' | 'audio' | 'document' | undefined;

      if (message.imageMessage) {
        mediaType = 'image';
      } else if (message.videoMessage) {
        mediaType = 'video';
      } else if (message.audioMessage) {
        mediaType = 'audio';
      } else if (message.documentMessage) {
        mediaType = 'document';
      }

      const text =
        (message.conversation as string) ||
        (message.extendedTextMessage as any)?.text ||
        (message.imageMessage as any)?.caption ||
        '';

      delete message.messageContextInfo;

      await this.handleIncomingMessage({
        id: info.id,
        chatId: info.chat,
        senderId: info.sender,
        senderName: info.pushName || 'Unknown',
        text,
        mediaPath,
        mediaType,
        rawMessage: message,
        timestamp: info.timestamp,
      });
    });

    const { jid } = await this.client.init();
    if (!jid) {
      await this.client.getQRChannel();
    }

    await this.client.connect();
  }

  async stop(): Promise<void> {
    await this.client.sendPresence('unavailable');
    await this.client.disconnect();
    this.client.close();
  }

  async sendText(
    chatId: string,
    text: string,
    replyToMessage?: IncomingMessage,
  ): Promise<void> {
    try {
      // human timeout para finjir pensamiento antes de comenzar a escribir
      await setTimeout(500 + Math.random() * 500);
      await this.client.sendChatPresence(chatId, 'composing');

      // finjir demora en la redaccion
      await setTimeout(text.length * (30 + Math.random() * 40));

      if (replyToMessage) {
        await this.client.sendRawMessage(chatId, {
          extendedTextMessage: {
            text,
            contextInfo: {
              stanzaID: replyToMessage.id,
              quotedType: 'EXPLICIT',
              participant: replyToMessage.senderId,
              quotedMessage: replyToMessage.rawMessage,
            },
          },
        });
      } else {
        await this.client.sendMessage(chatId, { conversation: text });
      }
    } finally {
      // cualquier final de este proceso implica que se termino de escribir
      await this.client.sendChatPresence(chatId, 'paused');
    }
  }

  getLatestQR(): string | null {
    return this.latestQR;
  }

  onMessage(callback: (msg: IncomingMessage) => Promise<void>): void {
    this.messageCallback = callback;
  }

  isAuthorized(senderId: string): boolean {
    const cleanSender = senderId.replace(/\D/g, '');
    return this.authorizedNumbers.some(
      (num) => cleanSender.endsWith(num) || num.endsWith(cleanSender),
    );
  }
}
