/**
 * Chinese (Simplified) translations
 *
 * PROVENANCE: Machine-authored translations (2026-07-10)
 * Native speaker review required before production use.
 */
import type { TranslationDictionary } from '../types/TranslationKeys'

export const zh: TranslationDictionary = {
  common: {
    appName: 'Vite 模板',
  },
  greeting: {
    hello: '你好',
    welcome: '欢迎使用本应用',
    formattedDate: '今天是',
    formattedPrice: '示例价格',
  },
  mobileMenu: {
    openMenu: '打开菜单',
    closeMenu: '关闭菜单',
    menuLabel: '主菜单',
    language: '语言',
    country: '国家',
    currency: '货币',
    theme: '主题',
  },
  navbar: {
    selectLanguage: '选择语言',
    selectCountry: '选择国家',
    selectCurrency: '选择货币',
    currentLanguage: '当前语言',
    currentCountry: '当前国家',
    currentCurrency: '当前货币',
    themeModeLight: '浅色模式',
    themeModeDark: '深色模式',
    themeModeSystem: '系统主题',
  },
  currency: {
    cop: '哥伦比亚比索',
    usd: '美元',
    eur: '欧元',
    gbp: '英镑',
    mxn: '墨西哥比索',
    cny: '人民币',
    jpy: '日元',
  },
  rates: {
    loading: '正在加载汇率...',
    stale: '汇率来自 {age} 之前',
    unavailable: '汇率不可用',
    partial: '部分汇率不可用',
  },
  a11y: {
    languageChangedTo: '语言已切换为',
    themeChangedTo: '主题已切换为',
    countryChangedTo: '国家已切换为',
    currencyChangedTo: '货币已切换为',
    skipToContent: '跳至主要内容',
    locationDetected: '位置已检测',
  },
  error: {
    title: '错误',
    reload: '重试',
  },
}
