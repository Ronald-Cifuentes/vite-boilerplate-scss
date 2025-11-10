import { AppProps } from './interfaces'
import { FC } from 'react'
import styles from './App.module.scss'

const App: FC<AppProps> = ({ dataTestId = 'app' }) => {
  return (
    <div className={styles.app} data-testid={dataTestId}>
      Hi
    </div>
  )
}

export default App
