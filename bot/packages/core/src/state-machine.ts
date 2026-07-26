import {
  UserSession,
  ProductDraft,
  IncomingMessage,
  IProduct,
} from '@bot/types';
import { extractData } from './extractor.ts';
import { GitHubService } from './github.ts';
import { readFileSync, unlinkSync } from 'fs';
import { extname } from 'path';

export class StateMachine {
  private sessions = new Map<string, UserSession>();
  private debounceMs: number;
  private allowedCurrencies: string[];
  private baseUrl: string;
  private github: GitHubService;

  constructor(
    github: GitHubService,
    debounceMs: number,
    allowedCurrencies: string[],
    baseUrl: string,
  ) {
    this.github = github;
    this.debounceMs = debounceMs;
    this.allowedCurrencies = allowedCurrencies;
    this.baseUrl = baseUrl;
  }

  getSession(senderId: string): UserSession {
    if (!this.sessions.has(senderId)) {
      this.sessions.set(senderId, {
        state: 'IDLE',
        pendingProducts: [],
        currentProductIndex: 0,
      });
    }
    return this.sessions.get(senderId)!;
  }

  async handleMessage(
    msg: IncomingMessage,
    sendReply: (text: string, replyTo?: IncomingMessage) => Promise<void>,
  ): Promise<void> {
    const session = this.getSession(msg.senderId);

    if (msg.mediaType === 'image' && msg.mediaPath) {
      this.handleMedia(msg, session, sendReply);
      return;
    }

    if (msg.text) {
      await this.handleText(msg, session, sendReply);
    }
  }

  private handleMedia(
    msg: IncomingMessage,
    session: UserSession,
    sendReply: (text: string, replyTo?: IncomingMessage) => Promise<void>,
  ) {
    if (session.debounceTimer) {
      clearTimeout(session.debounceTimer);
    }

    const ext = msg.mediaPath ? extname(msg.mediaPath) : '.jpg';
    const draft: ProductDraft = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      message: msg,
      mediaPath: msg.mediaPath,
      mediaExt: ext,
      categories: [],
    };

    session.pendingProducts.push(draft);
    session.state = 'WAITING_DEBOUNCE';

    session.debounceTimer = setTimeout(async () => {
      session.state = 'WAITING';
      session.currentProductIndex = 0;
      await this.processCurrentProduct(session, sendReply);
    }, this.debounceMs);
  }

  private async handleText(
    msg: IncomingMessage,
    session: UserSession,
    sendReply: (text: string, replyTo?: IncomingMessage) => Promise<void>,
  ) {
    if (
      session.state === 'WAITING_DEBOUNCE' &&
      session.pendingProducts.length > 0
    ) {
      const currentDraft =
        session.pendingProducts[session.pendingProducts.length - 1];
      const { price, currency, text } = extractData(
        msg.text,
        this.allowedCurrencies,
      );

      if (price) currentDraft.price = price;
      if (currency) currentDraft.currency = currency;

      if (text) {
        if (text.split(' ').length <= 6 && text.length < 50) {
          // is a short text, probably the title
          currentDraft.title = text;
        } else {
          currentDraft.description = text;
        }
      }
      return;
    }

    const currentDraft = session.pendingProducts[session.currentProductIndex];
    if (!currentDraft) return;

    const replyTo = currentDraft.message;

    switch (session.state) {
      case 'WAITING_TITLE': {
        const { text, price, currency } = extractData(
          msg.text,
          this.allowedCurrencies,
        );
        currentDraft.title = text || msg.text;
        if (price && !currentDraft.price) currentDraft.price = price;
        if (currency && !currentDraft.currency)
          currentDraft.currency = currency;
        await this.askForPrice(session, sendReply, replyTo);
        break;
      }
      case 'WAITING_PRICE': {
        const extracted = extractData(msg.text, this.allowedCurrencies);
        if (extracted.price) {
          currentDraft.price = extracted.price;
          if (extracted.currency) currentDraft.currency = extracted.currency;
        }
        await this.askForCurrencyConfirm(session, sendReply, replyTo);
        break;
      }
      case 'WAITING_CURRENCY_CONFIRM': {
        const lower = msg.text.toLowerCase();
        if (
          lower.includes('sí') ||
          lower.includes('si') ||
          lower.includes('ok') ||
          lower.includes('yes')
        ) {
          await this.askForDescription(session, sendReply, replyTo);
        } else {
          const extracted = extractData(msg.text, this.allowedCurrencies);
          if (extracted.currency) {
            currentDraft.currency = extracted.currency;
            await sendReply(
              `Moneda actualizada a ${extracted.currency}.`,
              replyTo,
            );
          }
          await this.askForDescription(session, sendReply, replyTo);
        }
        break;
      }
      case 'WAITING_DESCRIPTION': {
        const lower = msg.text.toLowerCase();
        if (
          lower.includes('no') ||
          lower.includes('skip') ||
          lower.includes('pasar')
        ) {
          currentDraft.description = currentDraft.title || 'Sin descripción';
        } else {
          currentDraft.description = msg.text;
        }
        await this.commitProduct(session, currentDraft, sendReply, replyTo);
        break;
      }
    }
  }

  private async processCurrentProduct(
    session: UserSession,
    sendReply: (text: string, replyTo?: IncomingMessage) => Promise<void>,
  ) {
    if (session.currentProductIndex >= session.pendingProducts.length) {
      await sendReply(
        '✅ ¡Todos los productos del lote han sido procesados y subidos!',
      );
      session.state = 'IDLE';
      session.pendingProducts = [];
      session.currentProductIndex = 0;
      return;
    }

    const draft = session.pendingProducts[session.currentProductIndex];
    const replyTo = draft.message;

    if (!draft.title) {
      await this.askForTitle(session, sendReply, replyTo);
    } else {
      await this.askForPrice(session, sendReply, replyTo);
    }
  }

  /**
   * Pedir el nombre del producto actual
   */
  private async askForTitle(
    session: UserSession,
    sendReply: (text: string, replyTo?: IncomingMessage) => Promise<void>,
    replyTo: IncomingMessage,
  ) {
    session.state = 'WAITING_TITLE';
    await sendReply(
      '📝 ¿Cuál es el *título* o nombre de este producto?',
      replyTo,
    );
  }

  /**
   * Pedir el precio del producto actual
   */
  private async askForPrice(
    session: UserSession,
    sendReply: (text: string, replyTo?: IncomingMessage) => Promise<void>,
    replyTo: IncomingMessage,
  ) {
    const draft = session.pendingProducts[session.currentProductIndex];
    if (draft.price) {
      await sendReply(
        `💰 Detecté el precio: *${draft.price}*. ¿Es correcto?`,
        replyTo,
      );
      session.state = 'WAITING_PRICE';
    } else {
      session.state = 'WAITING_PRICE';
      await sendReply(
        '💰 ¿Cuál es el *precio* de este producto? (Ej: 1000 CUP)',
        replyTo,
      );
    }
  }

  /**
   *
   */
  private async askForCurrencyConfirm(
    session: UserSession,
    sendReply: (text: string, replyTo?: IncomingMessage) => Promise<void>,
    replyTo: IncomingMessage,
  ) {
    const draft = session.pendingProducts[session.currentProductIndex];
    if (!draft.currency) draft.currency = this.allowedCurrencies[0] || 'CUP';

    session.state = 'WAITING_CURRENCY_CONFIRM';
    await sendReply(
      `💱 La moneda es *${draft.currency}*. ¿Confirmas? (Responde "sí" o envía otra moneda)`,
      replyTo,
    );
  }

  /**
   *
   */
  private async askForDescription(
    session: UserSession,
    sendReply: (text: string, replyTo?: IncomingMessage) => Promise<void>,
    replyTo: IncomingMessage,
  ) {
    const draft = session.pendingProducts[session.currentProductIndex];
    if (draft.description) {
      await this.commitProduct(session, draft, sendReply, replyTo);
      return;
    }

    session.state = 'WAITING_DESCRIPTION';
    await sendReply(
      '📄 Escribe una *descripción* para el producto (o responde "no" para omitir).',
      replyTo,
    );
  }

  /**
   *
   */
  private async commitProduct(
    session: UserSession,
    draft: ProductDraft,
    sendReply: (text: string, replyTo?: IncomingMessage) => Promise<void>,
    replyTo: IncomingMessage,
  ) {
    session.state = 'COMMITTING';
    await sendReply('⏳ Guardando producto y subiendo imágenes...', replyTo);

    try {
      let imageBuffer: Buffer | undefined;
      if (draft.mediaPath) {
        imageBuffer = readFileSync(draft.mediaPath);
        try {
          unlinkSync(draft.mediaPath);
        } catch {}
      }

      const product: IProduct = {
        id: draft.id,
        name: draft.title || 'Sin título',
        description: draft.description || draft.title || 'Sin descripción',
        price: draft.price || 0,
        currency: draft.currency || 'CUP',
        images: draft.mediaPath
          ? [`/images/${draft.id}${draft.mediaExt || '.jpg'}`]
          : [],
        categories:
          draft.categories.length > 0 ? draft.categories : ['General'],
        vip: false,
        featured: false,
        available: true,
      };

      await this.github.commitProduct(product, imageBuffer, draft.mediaExt);

      await sendReply(
        `✅ *Producto creado exitosamente!*\n\n` +
          `🔗 ${this.baseUrl}/products/${product.id}\n\n` +
          `Continuando con el siguiente...`,
        replyTo,
      );

      session.currentProductIndex++;
      await this.processCurrentProduct(session, sendReply);
    } catch (error) {
      console.error('GitHub commit error:', error);
      await sendReply(
        '❌ Error al subir el producto a GitHub. Inténtalo de más tarde o contacta al administrador.',
        replyTo,
      );
      session.state = 'IDLE';
      session.pendingProducts = [];
    }
  }
}
