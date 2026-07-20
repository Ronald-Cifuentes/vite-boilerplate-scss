/**
 * Global unhandled promise rejection handler (HIGH-001)
 *
 * Logs with recognizable prefix for debugging; does NOT swallow (no preventDefault).
 * TEMPLATE SEAM: Downstream projects add production reporting here (e.g., Sentry).
 */
export function handleUnhandledRejection(event: PromiseRejectionEvent): void {
  console.error('[UnhandledRejection]', event.reason)
}

export function registerUnhandledRejectionHandler(): void {
  globalThis.addEventListener('unhandledrejection', handleUnhandledRejection)
}
