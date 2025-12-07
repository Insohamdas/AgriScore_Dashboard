export type LogLevel = 'info' | 'warn' | 'error';

const isProd = import.meta.env.PROD;

const baseLog = (level: LogLevel, message: string, meta?: unknown) => {
  // In future, route this to a remote logger.
  // For now, centralize console usage for consistency.
  // eslint-disable-next-line no-console
  const fn = level === 'info' ? console.log : level === 'warn' ? console.warn : console.error;
  if (meta !== undefined) {
    fn(`[${level.toUpperCase()}] ${message}`, meta);
  } else {
    fn(`[${level.toUpperCase()}] ${message}`);
  }
};

export const log = {
  info: (message: string, meta?: unknown) => {
    if (!isProd) baseLog('info', message, meta);
  },
  warn: (message: string, meta?: unknown) => baseLog('warn', message, meta),
  error: (message: string, meta?: unknown) => baseLog('error', message, meta),
};
