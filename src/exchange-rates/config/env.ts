let m: string | undefined
export const setMockBanxicoToken = (t: string | undefined): void => {
  m = t
}
export const resetMockBanxicoToken = (): void => {
  m = undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const v: string | undefined = (globalThis as any).__VITE_BANXICO_TOKEN__
export const getBanxicoToken = (): string | undefined =>
  // istanbul ignore next
  m ?? v ?? (typeof process !== 'undefined' ? process?.env?.VITE_BANXICO_TOKEN : undefined)
