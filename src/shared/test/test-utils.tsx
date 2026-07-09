import { ReactElement, JSX } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { I18nProvider, type SupportedLocale } from '../../i18n'
import { ThemeProvider, type ThemePreference } from '../../theme'
import { RegionProvider, type SupportedRegion } from '../../region'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialLocale?: SupportedLocale
  initialPreference?: ThemePreference
  initialRegion?: SupportedRegion
}

export function renderWithProviders(
  ui: ReactElement,
  {
    initialLocale = 'en',
    initialPreference = 'light',
    initialRegion = 'US',
    ...options
  }: CustomRenderOptions = {}
): RenderResult {
  const Wrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
    <ThemeProvider initialPreference={initialPreference}>
      <RegionProvider initialRegion={initialRegion}>
        <I18nProvider initialLocale={initialLocale}>{children}</I18nProvider>
      </RegionProvider>
    </ThemeProvider>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}

export * from '@testing-library/react'
export { renderWithProviders as render }
