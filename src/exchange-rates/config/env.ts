let m: string | undefined
export const setMockBanxicoToken = (t: string | undefined): void => {
  m = t
}
export const resetMockBanxicoToken = (): void => {
  m = undefined
}

// Vite's define config replaces this pattern at build time (must match exactly)
const v: string | undefined = (globalThis as Record<string, unknown>).__VITE_BANXICO_TOKEN__ as
  string | undefined
export const getBanxicoToken = (): string | undefined =>
  // istanbul ignore next
  m ??
  v ??
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.VITE_BANXICO_TOKEN
