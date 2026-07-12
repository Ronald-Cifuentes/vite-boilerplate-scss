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
  mobileMenu: {
    openMenu: string
    closeMenu: string
    menuLabel: string
    language: string
    country: string
    currency: string
    theme: string
  }
  navbar: {
    selectLanguage: string
    selectCountry: string
    selectCurrency: string
    currentLanguage: string
    currentCountry: string
    currentCurrency: string
    // ThemeModeButton aria-labels (ADR-0009)
    themeModeLight: string
    themeModeDark: string
    themeModeSystem: string
  }
  currency: {
    cop: string
    usd: string
    eur: string
    gbp: string
    mxn: string
    cny: string
    jpy: string
  }
  rates: {
    loading: string
    stale: string
    unavailable: string
    partial: string
  }
  a11y: {
    languageChangedTo: string
    themeChangedTo: string
    countryChangedTo: string
    currencyChangedTo: string
    skipToContent: string
    locationDetected: string
  }
  error: {
    title: string
    reload: string
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
