export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  categories: string[];
  vip: boolean;
  featured: boolean;
  available: boolean;
}

export interface IncomingMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  mediaPath?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  rawMessage?: Record<string, unknown>;
  timestamp: number;
}

export interface IChannelAdapter {
  userAgent: string;
  start(): Promise<void>;
  stop(): Promise<void>;
  sendText(
    chatId: string,
    text: string,
    replyToMessage?: IncomingMessage,
  ): Promise<void>;
  getLatestQR(): string | null;
  onMessage(callback: (msg: IncomingMessage) => Promise<void>): void;
  isAuthorized(senderId: string): boolean;
}

export type BotState =
  | 'IDLE'
  | 'WAITING'
  | 'WAITING_DEBOUNCE'
  | 'WAITING_TITLE'
  | 'WAITING_PRICE'
  | 'WAITING_CURRENCY_CONFIRM'
  | 'WAITING_DESCRIPTION'
  | 'WAITING_CATEGORY'
  | 'COMMITTING';

export interface ProductDraft {
  id: string;
  message: IncomingMessage;
  mediaPath?: string;
  mediaExt?: string;
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  categories: string[];
}

export interface UserSession {
  state: BotState;
  pendingProducts: ProductDraft[];
  currentProductIndex: number;
  debounceTimer?: NodeJS.Timeout;
  lastMessage?: IncomingMessage;
}
