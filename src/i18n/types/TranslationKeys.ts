export interface TranslationDictionary {
  common: {
    appName: string
  }
  greeting: {
    hello: string
    welcome: string
  }
  languageSelector: {
    label: string
    changeLanguage: string
  }
  a11y: {
    languageSelectorDescription: string
    currentLanguage: string
  }
}

export type TranslationKey = FlattenKeys<TranslationDictionary>

type FlattenKeys<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? FlattenKeys<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`
    }[keyof T & string]
  : never
