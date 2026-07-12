import type { TranslationDictionary } from '../types/TranslationKeys'

export const en: TranslationDictionary = {
  common: {
    appName: 'Vite Boilerplate',
  },
  greeting: {
    hello: 'Hello',
    welcome: 'Welcome to the application',
    formattedDate: 'Today is',
    formattedPrice: 'Sample price',
  },
  mobileMenu: {
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menuLabel: 'Main menu',
    language: 'Language',
    country: 'Country',
    currency: 'Currency',
    theme: 'Theme',
  },
  navbar: {
    selectLanguage: 'Select language',
    selectCountry: 'Select country',
    selectCurrency: 'Select currency',
    currentLanguage: 'current language',
    currentCountry: 'current country',
    currentCurrency: 'current currency',
    themeModeLight: 'Light mode',
    themeModeDark: 'Dark mode',
    themeModeSystem: 'System theme',
  },
  currency: {
    cop: 'Colombian Peso',
    usd: 'US Dollar',
    eur: 'Euro',
    gbp: 'British Pound',
    mxn: 'Mexican Peso',
    cny: 'Chinese Yuan',
    jpy: 'Japanese Yen',
  },
  rates: {
    loading: 'Loading rates...',
    stale: 'Rates from {age} ago',
    unavailable: 'Rates unavailable',
    partial: 'Some rates unavailable',
  },
  a11y: {
    languageChangedTo: 'Language changed to',
    themeChangedTo: 'Theme changed to',
    countryChangedTo: 'Country changed to',
    currencyChangedTo: 'Currency changed to',
    skipToContent: 'Skip to content',
    locationDetected: 'Location detected',
  },
  error: {
    title: 'Error',
    reload: 'Retry',
  },
}
