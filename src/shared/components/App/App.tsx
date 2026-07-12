import { FC, useEffect, useCallback } from 'react'
import { ThemeProvider } from '../../../theme'
import { RegionProvider } from '../../../region'
import { setRegion } from '../../../region/signals/region-signal'
import { CurrencyProvider } from '../../../currency'
import { setCurrency } from '../../../currency/signals/currency-signal'
import { I18nProvider } from '../../../i18n'
import { setLocale } from '../../../i18n/signals/translator'
import { isSupportedLocale, LOCALE_STORAGE_KEY } from '../../../i18n/config/locales'
import { isValidRegion, REGION_STORAGE_KEY } from '../../../region/config/regions'
import { isValidCurrency, CURRENCY_STORAGE_KEY } from '../../../currency/config/currencies'
import { initializeRates } from '../../../exchange-rates'
import { useGeoDetection } from '../../../geo-detection/hooks/useGeoDetection'
import type { GeoDetectionApplied } from '../../../geo-detection/hooks/useGeoDetection'
import { Navbar } from '../../../features/navbar'
import { Greeting } from '../../../features/greeting'
import type { AppProps } from './interfaces'
import type { SupportedLocale } from '../../../i18n'
import type { SupportedRegion } from '../../../region'
import type { SupportedCurrency } from '../../../currency'
import styles from './App.module.scss'

export const App: FC<AppProps> = ({ dataTestId = 'app' }) => {
  useEffect(() => {
    initializeRates()
  }, [])

  const handleGeoDetected = useCallback(
    ({ locale, region, currency, source }: GeoDetectionApplied): void => {
      const save = (k: string, v: string): void => {
        try {
          localStorage.setItem(k, v)
        } catch {
          /* */
        }
      }
      if (source === 'gps' || source === 'ip') {
        if (isSupportedLocale(locale)) {
          setLocale(locale as SupportedLocale)
          save(LOCALE_STORAGE_KEY, locale)
        }
        if (isValidRegion(region)) {
          setRegion(region as SupportedRegion)
          save(REGION_STORAGE_KEY, region)
        }
        if (isValidCurrency(currency)) {
          setCurrency(currency as SupportedCurrency, true)
          save(CURRENCY_STORAGE_KEY, currency)
        }
        return
      }
      if (source === 'device-language') {
        if (isSupportedLocale(locale)) {
          setLocale(locale as SupportedLocale)
          save(LOCALE_STORAGE_KEY, locale)
        }
      }
    },
    []
  )

  useGeoDetection({
    onDetected: handleGeoDetected,
  })

  return (
    <ThemeProvider>
      <RegionProvider>
        <CurrencyProvider>
          <I18nProvider>
            <div className={styles.app} data-testid={dataTestId}>
              <header className={styles.header}>
                <Navbar dataTestId={`${dataTestId}-navbar`} />
              </header>
              <main className={styles.main}>
                <Greeting dataTestId={`${dataTestId}-greeting`} />
              </main>
            </div>
          </I18nProvider>
        </CurrencyProvider>
      </RegionProvider>
    </ThemeProvider>
  )
}

export default App
