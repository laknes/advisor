export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { LogService } = await import('@/server/services/LogService');

  process.on('uncaughtException', (error) => {
    console.error('[process] Uncaught exception:', error);
    LogService.log({
      level: 'error',
      source: 'process',
      message: error.message || 'Uncaught exception',
      stack: error.stack,
    }).catch(() => undefined);
  });

  process.on('unhandledRejection', (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    console.error('[process] Unhandled rejection:', error);
    LogService.log({
      level: 'error',
      source: 'process',
      message: error.message || 'Unhandled rejection',
      stack: error.stack,
    }).catch(() => undefined);
  });
}
