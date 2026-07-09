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
  languageSelector: {
    label: 'Language',
    changeLanguage: 'Change language',
  },
  navbar: {
    language: 'Language',
    theme: 'Theme',
    country: 'Country',
    currency: 'Currency',
    selectLanguage: 'Select language',
    selectCountry: 'Select country',
    selectCurrency: 'Select currency',
    currentLanguage: 'current language',
    currentCountry: 'current country',
    currentCurrency: 'current currency',
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    themeModeLight: 'Light mode',
    themeModeDark: 'Dark mode',
    themeModeSystem: 'System theme',
  },
  currency: {
    usd: 'US Dollar',
    eur: 'Euro',
    gbp: 'British Pound',
    mxn: 'Mexican Peso',
  },
  a11y: {
    languageSelectorDescription: 'Select your preferred language',
    currentLanguage: 'Current language',
    languageChangedTo: 'Language changed to',
    themeChangedTo: 'Theme changed to',
    countryChangedTo: 'Country changed to',
    currencyChangedTo: 'Currency changed to',
    skipToContent: 'Skip to content',
  },
}
