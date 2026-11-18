type Level = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

function log(level: Level, message: string): void {
  if (level === 'DEBUG' && !process.env.DEBUG_LOGS) return;
  // eslint-disable-next-line no-console
  console.log(`[${new Date().toISOString()}] [${level}] ${message}`);
}

export const logger = {
  info: (msg: string) => log('INFO', msg),
  warn: (msg: string) => log('WARN', msg),
  error: (msg: string) => log('ERROR', msg),
  debug: (msg: string) => log('DEBUG', msg),
};
