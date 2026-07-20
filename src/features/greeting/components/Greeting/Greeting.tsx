import { FC } from 'react'
import { useTranslation } from '../../../../i18n'
import { useRegion } from '../../../../region'
import { useCurrency } from '../../../../currency'
import { useExchangeRates, formatAmount, BASE_PRICE_COP } from '../../../../exchange-rates'
import type { GreetingProps } from './interfaces'
import styles from './Greeting.module.scss'

export const Greeting: FC<GreetingProps> = ({ dataTestId = 'greeting', className }) => {
  const { t } = useTranslation()
  const { formatDate } = useRegion()
  const { currency } = useCurrency()
  const { state, convert } = useExchangeRates()
  const cls = className ? `${styles.greeting} ${className}` : styles.greeting

  const date = formatDate(new Date())
  const cp = convert(BASE_PRICE_COP, currency)
  const price = cp === null ? formatAmount(BASE_PRICE_COP, 'COP') : formatAmount(cp, currency)

  const getStatus = (): string | null => {
    const { status: s, staleAgeMs: a } = state
    if (s === 'loading') return t('rates.loading')
    if (s === 'stale' && a) {
      const h = Math.floor(a / 3600000),
        m = Math.floor((a % 3600000) / 60000)
      return t('rates.stale').replace('{age}', h > 0 ? `${h}h ${m}m` : `${m}m`)
    }
    if (s === 'stale') return t('rates.stale').replace('{age}', '?')
    if (s === 'partial') return t('rates.partial')
    if (s === 'unavailable') return t('rates.unavailable')
    return null
  }

  const statusText = getStatus()

  return (
    <div className={cls} data-testid={dataTestId}>
      <h1 className={styles.title} data-testid={`${dataTestId}-title`}>
        {t('greeting.hello')}
      </h1>
      <p className={styles.subtitle} data-testid={`${dataTestId}-subtitle`}>
        {t('greeting.welcome')}
      </p>
      <p className={styles.formatted} data-testid={`${dataTestId}-date`}>
        {t('greeting.formattedDate')}: <strong>{date}</strong>
      </p>
      <p className={styles.formatted} data-testid={`${dataTestId}-price`}>
        {t('greeting.formattedPrice')}:{' '}
        <strong data-testid={`${dataTestId}-price-value`}>{price}</strong>
        {statusText && (
          <span className={styles.rateStatus} data-testid={`${dataTestId}-rate-status`}>
            {' '}
            ({statusText})
          </span>
        )}
      </p>
    </div>
  )
}
