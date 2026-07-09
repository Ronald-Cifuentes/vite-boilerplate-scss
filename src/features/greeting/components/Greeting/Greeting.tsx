import { FC } from 'react'
import { useTranslation } from '../../../../i18n'
import { useRegion } from '../../../../region'
import { useCurrency } from '../../../../currency'
import type { GreetingProps } from './interfaces'
import styles from './Greeting.module.scss'

export const Greeting: FC<GreetingProps> = ({ dataTestId = 'greeting', className }) => {
  const { t } = useTranslation()
  const { formatDate } = useRegion()
  const { formatCurrency } = useCurrency()
  const containerClassName = className ? `${styles.greeting} ${className}` : styles.greeting

  // Demonstrate region-based formatting with real values
  // Using region for dates and currency for prices ensures proper localization
  const formattedDate = formatDate(new Date())
  const formattedPrice = formatCurrency(1234.56)

  return (
    <div className={containerClassName} data-testid={dataTestId}>
      <h1 className={styles.title} data-testid={`${dataTestId}-title`}>
        {t('greeting.hello')}
      </h1>
      <p className={styles.subtitle} data-testid={`${dataTestId}-subtitle`}>
        {t('greeting.welcome')}
      </p>
      <p className={styles.formatted} data-testid={`${dataTestId}-date`}>
        {t('greeting.formattedDate')}: <strong>{formattedDate}</strong>
      </p>
      <p className={styles.formatted} data-testid={`${dataTestId}-price`}>
        {t('greeting.formattedPrice')}: <strong>{formattedPrice}</strong>
      </p>
    </div>
  )
}

export default Greeting
