import { FC, useId } from 'react'
import { useTranslation, LOCALE_METADATA, type SupportedLocale } from '../../../../i18n'
import type { LanguageSelectorProps } from './interfaces'
import styles from './LanguageSelector.module.scss'

export const LanguageSelector: FC<LanguageSelectorProps> = ({
  dataTestId = 'language-selector',
  className,
  onLocaleChange,
}) => {
  const { t, locale, setLocale, supportedLocales } = useTranslation()
  const selectId = useId()
  const descriptionId = useId()

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const newLocale = event.target.value as SupportedLocale
    setLocale(newLocale)
    onLocaleChange?.(newLocale)
  }

  const containerClassName = className
    ? `${styles.languageSelector} ${className}`
    : styles.languageSelector

  return (
    <div className={containerClassName} data-testid={dataTestId}>
      <label htmlFor={selectId} className={styles.label}>
        {t('languageSelector.label')}
      </label>
      <select
        id={selectId}
        value={locale}
        onChange={handleChange}
        className={styles.select}
        aria-describedby={descriptionId}
        data-testid={`${dataTestId}-select`}
      >
        {supportedLocales.map(localeCode => {
          const meta = LOCALE_METADATA[localeCode]
          return (
            <option key={localeCode} value={localeCode}>
              {meta.nativeName}
            </option>
          )
        })}
      </select>
      <span id={descriptionId} className={styles.srOnly}>
        {t('a11y.languageSelectorDescription')}
      </span>
    </div>
  )
}

export default LanguageSelector
