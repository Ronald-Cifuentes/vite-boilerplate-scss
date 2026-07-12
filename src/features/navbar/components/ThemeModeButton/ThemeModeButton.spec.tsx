import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeModeButton } from './ThemeModeButton'
import { I18nProvider } from '../../../../i18n'
import { ThemeProvider } from '../../../../theme'
import { RegionProvider } from '../../../../region'
import { themePreferenceSignal, osPrefersDarkSignal } from '../../../../theme/signals/theme-signal'
import { resetAnnouncements } from '../../signals/announcement-signal'
import { THEME_STORAGE_KEY } from '../../../../theme/config/themes'

const TestWrapper = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
  <ThemeProvider>
    <RegionProvider>
      <I18nProvider>{children}</I18nProvider>
    </RegionProvider>
  </ThemeProvider>
)

const renderButton = (props = {}): ReturnType<typeof render> =>
  render(
    <TestWrapper>
      <ThemeModeButton {...props} />
    </TestWrapper>
  )

const setInitialPreference = (pref: 'light' | 'dark' | 'system'): void => {
  localStorage.setItem(THEME_STORAGE_KEY, pref)
}

const mockMatchMedia = (prefersDark: boolean): void => {
  window.matchMedia = jest.fn().mockReturnValue({
    matches: prefersDark,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })
}

describe('ThemeModeButton', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    // Wrap signal mutations in act
    act(() => {
      themePreferenceSignal.value = 'system'
      osPrefersDarkSignal.value = false
      resetAnnouncements()
    })
    document.body.innerHTML = ''
    mockMatchMedia(false)
  })

  afterEach(() => jest.useRealTimers())

  it('renders button with icon and applies custom props', () => {
    renderButton({ className: 'custom', dataTestId: 'my-btn' })
    expect(screen.getByTestId('my-btn')).toHaveClass('custom')
    expect(screen.getByTestId('my-btn-button').querySelector('svg')).toBeInTheDocument()
  })

  describe('ARIA attributes (ADR-0009)', () => {
    it('does NOT have aria-haspopup or aria-expanded', () => {
      renderButton()
      const button = screen.getByTestId('theme-mode-button-button')
      expect(button).not.toHaveAttribute('aria-haspopup')
      expect(button).not.toHaveAttribute('aria-expanded')
    })

    it.each([
      ['system', 'System theme'],
      ['light', 'Light mode'],
      ['dark', 'Dark mode'],
    ] as const)('has aria-label "%s" for preference %s', (pref, label) => {
      setInitialPreference(pref)
      renderButton()
      expect(screen.getByTestId('theme-mode-button-button')).toHaveAccessibleName(label)
    })
  })

  describe('Cycle order (light -> dark -> system -> light)', () => {
    it.each([
      ['light', 'dark'],
      ['dark', 'system'],
      ['system', 'light'],
    ] as const)('cycles from %s to %s', async (from, to) => {
      setInitialPreference(from)
      renderButton()
      await userEvent.click(screen.getByTestId('theme-mode-button-button'))
      expect(themePreferenceSignal.value).toBe(to)
    })

    it('completes full cycle', async () => {
      setInitialPreference('light')
      renderButton()
      const btn = screen.getByTestId('theme-mode-button-button')
      await userEvent.click(btn)
      expect(themePreferenceSignal.value).toBe('dark')
      await userEvent.click(btn)
      expect(themePreferenceSignal.value).toBe('system')
      await userEvent.click(btn)
      expect(themePreferenceSignal.value).toBe('light')
    })
  })

  describe('Icons', () => {
    it.each(['light', 'dark', 'system'] as const)('shows icon for %s preference', pref => {
      setInitialPreference(pref)
      renderButton()
      expect(
        screen.getByTestId('theme-mode-button-button').querySelector('svg')
      ).toBeInTheDocument()
    })

    it('changes icon when preference cycles', async () => {
      setInitialPreference('light')
      renderButton()
      const btn = screen.getByTestId('theme-mode-button-button')
      const before = btn.querySelector('svg')?.outerHTML
      await userEvent.click(btn)
      expect(btn.querySelector('svg')?.outerHTML).not.toBe(before)
    })
  })

  describe('Callback', () => {
    it.each([
      ['light', 'dark'],
      ['dark', 'system'],
    ] as const)('calls onPreferenceChange with %s when cycling from %s', async (from, expected) => {
      setInitialPreference(from)
      const cb = jest.fn()
      renderButton({ onPreferenceChange: cb })
      await userEvent.click(screen.getByTestId('theme-mode-button-button'))
      expect(cb).toHaveBeenCalledWith(expected)
    })
  })

  describe('Announcer', () => {
    it.each([
      ['light', 'Dark mode'],
      ['dark', 'System theme'],
    ] as const)('announces next preference when cycling from %s', async (from, text) => {
      setInitialPreference(from)
      jest.useFakeTimers()
      renderButton()
      fireEvent.click(screen.getByTestId('theme-mode-button-button'))
      await act(async () => jest.runAllTimers())
      expect(screen.getByTestId('theme-mode-button-announcer')).toHaveTextContent(text)
    })
  })

  describe('Keyboard', () => {
    it.each(['Enter', ' '])('cycles on %s key', async key => {
      setInitialPreference('light')
      renderButton()
      screen.getByTestId('theme-mode-button-button').focus()
      await userEvent.keyboard(key === ' ' ? ' ' : '{Enter}')
      expect(themePreferenceSignal.value).toBe('dark')
    })
  })

  describe('System resolution', () => {
    it('resolves to light when OS prefers light and preference=system', () => {
      mockMatchMedia(false)
      setInitialPreference('system')
      renderButton()
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    it('resolves to dark when OS prefers dark and preference=system', () => {
      mockMatchMedia(true)
      setInitialPreference('system')
      renderButton()
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    it('uses explicit preference regardless of OS', () => {
      mockMatchMedia(true)
      setInitialPreference('light')
      renderButton()
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })
  })

  it('has button element for touch target', () => {
    renderButton()
    expect(screen.getByTestId('theme-mode-button-button').tagName).toBe('BUTTON')
  })
})
