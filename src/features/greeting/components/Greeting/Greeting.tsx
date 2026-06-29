import { FC } from 'react'
import { useTranslation } from '../../../../i18n'
import type { GreetingProps } from './interfaces'
import styles from './Greeting.module.scss'

export const Greeting: FC<GreetingProps> = ({ dataTestId = 'greeting', className }) => {
  const { t } = useTranslation()
  const containerClassName = className ? `${styles.greeting} ${className}` : styles.greeting

  return (
    <div className={containerClassName} data-testid={dataTestId}>
      <h1 className={styles.title} data-testid={`${dataTestId}-title`}>
        {t('greeting.hello')}
      </h1>
      <p className={styles.subtitle} data-testid={`${dataTestId}-subtitle`}>
        {t('greeting.welcome')}
      </p>
    </div>
  )
}

export default Greeting
