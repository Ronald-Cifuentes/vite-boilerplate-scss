export interface TranslationDictionary {
  common: {
    appName: string
  }
  greeting: {
    hello: string
    welcome: string
    formattedDate: string
    formattedPrice: string
  }
  languageSelector: {
    label: string
    changeLanguage: string
  }
  navbar: {
    language: string
    theme: string
    country: string
    currency: string
    selectLanguage: string
    selectCountry: string
    selectCurrency: string
    currentLanguage: string
    currentCountry: string
    currentCurrency: string
    lightMode: string
    darkMode: string
    // ThemeModeButton aria-labels (ADR-0009)
    themeModeLight: string
    themeModeDark: string
    themeModeSystem: string
  }
  currency: {
    usd: string
    eur: string
    gbp: string
    mxn: string
  }
  a11y: {
    languageSelectorDescription: string
    currentLanguage: string
    languageChangedTo: string
    themeChangedTo: string
    countryChangedTo: string
    currencyChangedTo: string
    skipToContent: string
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
