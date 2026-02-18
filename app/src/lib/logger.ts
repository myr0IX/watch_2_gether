type LogContext = Record<string, unknown>;

function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace('T', ' ').split('.')[0];
}

function formatContext(context?: LogContext): string {
  if (!context || Object.keys(context).length === 0) {
    return '';
  }
  return `\n  Context: ${JSON.stringify(context, null, 2)}`;
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    const timestamp = formatTimestamp();
    console.debug(`[${timestamp}] DEBUG: ${message}${formatContext(context)}`);
  },

  error(message: string, context?: LogContext): void {
    const timestamp = formatTimestamp();
    console.error(`[${timestamp}] ERROR: ${message}${formatContext(context)}`);
  },
};
