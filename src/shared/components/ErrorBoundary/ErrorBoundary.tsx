import { Component, FC, ReactNode } from 'react'
import { useTranslation } from '../../../i18n/hooks/useTranslation'

// CRIT-001: TEMPLATE SEAM for reporters. Hardcoded fallbacks per CONTRACTS.
type P = { children: ReactNode; t?: string; b?: string }

export class ErrorBoundaryCore extends Component<P, { e: boolean }> {
  state = { e: false }
  static getDerivedStateFromError(): { e: boolean } {
    return { e: true }
  }
  componentDidCatch(): void {} // SEAM: reporters
  render(): ReactNode {
    const { e } = this.state
    const { t, b, children } = this.props
    return e ? (
      <div role='alert'>
        {t || '!'}
        <button onClick={(): void => location.reload()}>{b || '!'}</button>
      </div>
    ) : (
      children
    )
  }
}

export const ErrorBoundary: FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation()
  return (
    <ErrorBoundaryCore t={t('error.title')} b={t('error.reload')}>
      {children}
    </ErrorBoundaryCore>
  )
}
