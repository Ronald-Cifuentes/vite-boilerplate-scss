import type { TranslationDictionary } from '../types/TranslationKeys'

export const es: TranslationDictionary = {
  common: {
    appName: 'Plantilla Vite',
  },
  greeting: {
    hello: 'Hola',
    welcome: 'Bienvenido a la aplicacion',
    formattedDate: 'Hoy es',
    formattedPrice: 'Precio de muestra',
  },
  languageSelector: {
    label: 'Idioma',
    changeLanguage: 'Cambiar idioma',
  },
  navbar: {
    language: 'Idioma',
    theme: 'Tema',
    country: 'Pais',
    currency: 'Moneda',
    selectLanguage: 'Seleccionar idioma',
    selectCountry: 'Seleccionar pais',
    selectCurrency: 'Seleccionar moneda',
    currentLanguage: 'idioma actual',
    currentCountry: 'pais actual',
    currentCurrency: 'moneda actual',
    lightMode: 'Modo claro',
    darkMode: 'Modo oscuro',
    themeModeLight: 'Modo claro',
    themeModeDark: 'Modo oscuro',
    themeModeSystem: 'Tema del sistema',
  },
  currency: {
    usd: 'Dolar estadounidense',
    eur: 'Euro',
    gbp: 'Libra esterlina',
    mxn: 'Peso mexicano',
  },
  a11y: {
    languageSelectorDescription: 'Seleccione su idioma preferido',
    currentLanguage: 'Idioma actual',
    languageChangedTo: 'Idioma cambiado a',
    themeChangedTo: 'Tema cambiado a',
    countryChangedTo: 'Pais cambiado a',
    currencyChangedTo: 'Moneda cambiada a',
    skipToContent: 'Saltar al contenido',
  },
}
