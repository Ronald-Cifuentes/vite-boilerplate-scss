import { FC } from 'react'
import { ThemeProvider } from '../../../theme'
import { RegionProvider } from '../../../region'
import { CurrencyProvider } from '../../../currency'
import { I18nProvider } from '../../../i18n'
import { Navbar } from '../../../features/navbar'
import { Greeting } from '../../../features/greeting'
import type { AppProps } from './interfaces'
import styles from './App.module.scss'

export const App: FC<AppProps> = ({ dataTestId = 'app' }) => {
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
