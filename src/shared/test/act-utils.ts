/**
 * Shared test utilities for proper act() wrapping of signal mutations.
 *
 * React Testing Library requires state updates to be wrapped in act() when they
 * occur outside of React's normal event handling. Preact signals mutations
 * that affect mounted components MUST be wrapped.
 *
 * @module act-utils
 */
import { act } from '@testing-library/react'

import { localeSignal, localeLoadingSignal } from '../../i18n/signals/locale-signal'
import { regionSignal } from '../../region/signals/region-signal'
import { currencySignal, userOverriddenSignal } from '../../currency/signals/currency-signal'
import { themePreferenceSignal, osPrefersDarkSignal } from '../../theme/signals/theme-signal'
import { ratesStateSignal, lastRefreshSignal } from '../../exchange-rates/signals/rates-signal'
import {
  mobileMenuOpenSignal,
  expandedItemSignal,
} from '../../features/mobile-menu/signals/mobile-menu-signal'
import {
  languageAnnouncementSignal,
  themeAnnouncementSignal,
  countryAnnouncementSignal,
  currencyAnnouncementSignal,
} from '../../features/navbar/signals/announcement-signal'

import { DEFAULT_LOCALE } from '../../i18n/config/locales'
import { DEFAULT_REGION } from '../../region/config/regions'
import { DEFAULT_PREFERENCE } from '../../theme/config/themes'

/**
 * Default mock rates for testing - produces exact user example values:
 * $4,500 COP = $1.37 USD = EUR1.20 EUR = MX$23.94 MXN = GBP1.02 GBP
 */
export const DEFAULT_MOCK_RATES = {
  status: 'live' as const,
  rates: {
    USD: { copPerUnit: 3284.6715, sourceDate: new Date(), retrievedAt: new Date() },
    EUR: { copPerUnit: 3750.0, sourceDate: new Date(), retrievedAt: new Date() },
    GBP: { copPerUnit: 4411.7647, sourceDate: new Date(), retrievedAt: new Date() },
    MXN: { copPerUnit: 187.9699, sourceDate: new Date(), retrievedAt: new Date() },
  },
}

/**
 * Consolidated app state reset for test isolation.
 * Replaces duplicated beforeEach blocks across test suites.
 *
 * This function is act-wrapped so it's safe to call in beforeEach/afterEach
 * even when components may be mounted (though typically called before render).
 *
 * Resets:
 * - All signals to their default values
 * - localStorage
 * - Document attributes (lang, data-theme)
 * - Body overflow style
 */
export function resetAppState(): void {
  act(() => {
    localStorage.clear()

    document.documentElement.lang = 'en'
    document.documentElement.removeAttribute('data-theme')
    document.body.style.overflow = ''

    localeSignal.value = DEFAULT_LOCALE
    localeLoadingSignal.value = false

    regionSignal.value = DEFAULT_REGION

    currencySignal.value = 'USD'
    userOverriddenSignal.value = false

    themePreferenceSignal.value = DEFAULT_PREFERENCE
    osPrefersDarkSignal.value = false

    ratesStateSignal.value = DEFAULT_MOCK_RATES
    lastRefreshSignal.value = null

    mobileMenuOpenSignal.value = false
    expandedItemSignal.value = null

    languageAnnouncementSignal.value = ''
    themeAnnouncementSignal.value = ''
    countryAnnouncementSignal.value = ''
    currencyAnnouncementSignal.value = ''
  })
}
