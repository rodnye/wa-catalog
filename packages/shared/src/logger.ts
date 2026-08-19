import pino from 'pino';

const meta = import.meta as ImportMeta & { env: Record<string, string> }

/**
 *
 */
export const logger = pino({
  level: meta.env.PUBLIC_LOG_LEVEL || meta.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

