/**
 * Side effects that should run in response to locale changes.
 *
 * Kept in pure functions (not inline in components) so they're trivially
 * testable and the React adapter layer stays declarative.
 */

export function syncHtmlLang(locale: string): void {
  document.documentElement.lang = locale
}
