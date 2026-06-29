export type SupportedLocale = 'en' | 'es'

export interface LocaleMetadata {
  readonly code: SupportedLocale
  readonly nativeName: string
  readonly englishName: string
  readonly direction: 'ltr' | 'rtl'
}
