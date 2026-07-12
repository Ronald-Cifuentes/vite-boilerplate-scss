import { FC, useCallback, useMemo } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { MdAttachMoney, MdEuro, MdCurrencyPound, MdCurrencyYen } from 'react-icons/md'
import { Dropdown } from '../../../../shared/components/Dropdown'
import type { DropdownOption } from '../../../../shared/components/Dropdown'
import { Announcer } from '../../../../shared/components/Announcer'
import { useCurrency, SUPPORTED_CURRENCIES } from '../../../../currency'
import type { SupportedCurrency } from '../../../../currency'
import { useTranslation } from '../../../../i18n'
import {
  currencyAnnouncementSignal,
  setCurrencyAnnouncement,
} from '../../signals/announcement-signal'
import type { CurrencyDropdownProps } from './interfaces'

const CURRENCY_ICONS: Record<SupportedCurrency, typeof MdAttachMoney> = {
  COP: MdAttachMoney, // COP uses dollar sign icon (same as USD/MXN)
  USD: MdAttachMoney,
  EUR: MdEuro,
  GBP: MdCurrencyPound,
  MXN: MdAttachMoney, // MXN uses same icon as USD (dollar sign)
  CNY: MdCurrencyYen, // CNY uses yen icon (both CNY/JPY use yen symbol variations)
  JPY: MdCurrencyYen,
}

/**
 * Dropdown for selecting display currency.
 * New component per ADR-0007 and CONTRACTS.md v3.
 */
export const CurrencyDropdown: FC<CurrencyDropdownProps> = ({
  dataTestId = 'currency-dropdown',
  className,
  onCurrencyChange,
}) => {
  useSignals()
  const { t } = useTranslation()
  const { currency, setCurrency } = useCurrency()

  const options: DropdownOption<SupportedCurrency>[] = useMemo(
    () =>
      SUPPORTED_CURRENCIES.map(curr => ({
        value: curr,
        label: t(`currency.${curr.toLowerCase()}` as 'currency.usd'),
        icon: CURRENCY_ICONS[curr],
      })),
    [t]
  )

  const handleChange = useCallback(
    (newCurrency: SupportedCurrency): void => {
      setCurrency(newCurrency)
      onCurrencyChange?.(newCurrency)

      const currencyName = t(`currency.${newCurrency.toLowerCase()}` as 'currency.usd')
      setCurrencyAnnouncement(`${t('a11y.currencyChangedTo')} ${currencyName}`)
    },
    [setCurrency, onCurrencyChange, t]
  )

  const currentCurrencyName = t(`currency.${currency.toLowerCase()}` as 'currency.usd')
  const triggerLabel = `${t('navbar.selectCurrency')}, ${t('navbar.currentCurrency')}: ${currentCurrencyName}`

  return (
    <>
      <Dropdown
        options={options}
        value={currency}
        onChange={handleChange}
        triggerIcon={MdAttachMoney}
        triggerLabel={triggerLabel}
        id='currency-dropdown'
        dataTestId={dataTestId}
        className={className}
      />
      <Announcer
        message={currencyAnnouncementSignal.value}
        dataTestId={`${dataTestId}-announcer`}
      />
    </>
  )
}
