import { FC } from 'react'
import { I18nProvider } from '../../../i18n'
import { LanguageSelector } from '../../../features/language-selector'
import { Greeting } from '../../../features/greeting'
import type { AppProps } from './interfaces'
import styles from './App.module.scss'

export const App: FC<AppProps> = ({ dataTestId = 'app' }) => {
  return (
    <I18nProvider>
      <div className={styles.app} data-testid={dataTestId}>
        <header className={styles.header}>
          <LanguageSelector />
        </header>
        <main className={styles.main}>
          <Greeting />
        </main>
      </div>
    </I18nProvider>
  )
}

export default App
