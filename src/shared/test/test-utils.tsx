import { ReactElement, JSX } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { I18nProvider, type SupportedLocale } from '../../i18n'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialLocale?: SupportedLocale
}

export function renderWithProviders(
  ui: ReactElement,
  { initialLocale = 'en', ...options }: CustomRenderOptions = {}
): RenderResult {
  const Wrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
    <I18nProvider initialLocale={initialLocale}>{children}</I18nProvider>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}

export * from '@testing-library/react'
export { renderWithProviders as render }
