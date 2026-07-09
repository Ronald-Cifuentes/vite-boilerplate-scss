import { render, screen, act } from '@testing-library/react'
import { ThemeProvider } from './ThemeProvider'
import { themePreferenceSignal, osPrefersDarkSignal, setPreference } from '../signals/theme-signal'
import { DEFAULT_PREFERENCE, THEME_STORAGE_KEY } from '../config/themes'

describe('ThemeProvider', () => {
  let matchMediaMock: jest.Mock
  let addEventListenerMock: jest.Mock
  let removeEventListenerMock: jest.Mock

  beforeEach(() => {
    // Reset signals and localStorage
    themePreferenceSignal.value = DEFAULT_PREFERENCE
    osPrefersDarkSignal.value = false
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')

    // Mock matchMedia
    addEventListenerMock = jest.fn()
    removeEventListenerMock = jest.fn()
    matchMediaMock = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    })
    window.matchMedia = matchMediaMock
  })

  describe('Given initialPreference prop is provided', () => {
    it('Then preference is set to initialPreference', () => {
      render(
        <ThemeProvider initialPreference='dark'>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(themePreferenceSignal.value).toBe('dark')
    })

    it('Then system preference is accepted', () => {
      render(
        <ThemeProvider initialPreference='system'>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(themePreferenceSignal.value).toBe('system')
    })
  })

  describe('Given localStorage has persisted preference', () => {
    it('Then preference is loaded from localStorage (light)', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light')

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(themePreferenceSignal.value).toBe('light')
    })

    it('Then preference is loaded from localStorage (dark)', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark')

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(themePreferenceSignal.value).toBe('dark')
    })

    it('Then preference is loaded from localStorage (system)', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'system')

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(themePreferenceSignal.value).toBe('system')
    })
  })

  describe('Given no localStorage and no initialPreference', () => {
    it('Then default preference is system', () => {
      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(themePreferenceSignal.value).toBe('system')
    })
  })

  describe('Given preference signal changes', () => {
    it('Then data-theme attribute is synced based on effective mode', () => {
      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      act(() => {
        setPreference('dark')
      })

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    it('Then preference is persisted to localStorage', () => {
      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      act(() => {
        setPreference('dark')
      })

      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    })

    it('Then system preference is persisted to localStorage', () => {
      themePreferenceSignal.value = 'light'

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      act(() => {
        setPreference('system')
      })

      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system')
    })
  })

  describe('Given OS color-scheme changes', () => {
    it('Then event listener is registered', () => {
      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('Then osPrefersDarkSignal is updated on change', () => {
      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      // Simulate OS change to dark
      const changeHandler = addEventListenerMock.mock.calls[0][1]
      act(() => {
        changeHandler({ matches: true })
      })

      expect(osPrefersDarkSignal.value).toBe(true)
    })

    it('Then data-theme updates when preference is system and OS changes', () => {
      // Set preference to system
      themePreferenceSignal.value = 'system'
      osPrefersDarkSignal.value = false

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      // Initial should be light (OS prefers light)
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')

      // Simulate OS change to dark
      const changeHandler = addEventListenerMock.mock.calls[0][1]
      act(() => {
        changeHandler({ matches: true })
      })

      // Should flip to dark
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    it('Then data-theme does NOT update when preference is explicit', () => {
      // Set explicit light preference via localStorage (how users would have it)
      localStorage.setItem(THEME_STORAGE_KEY, 'light')

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.getAttribute('data-theme')).toBe('light')

      // Simulate OS change to dark
      const changeHandler = addEventListenerMock.mock.calls[0][1]
      act(() => {
        changeHandler({ matches: true })
      })

      // Should remain light (explicit preference ignores OS changes)
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })
  })

  describe('Given component unmounts', () => {
    it('Then event listener is cleaned up', () => {
      const { unmount } = render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      unmount()

      expect(removeEventListenerMock).toHaveBeenCalled()
    })
  })

  describe('Given children are rendered', () => {
    it('Then children are displayed', () => {
      render(
        <ThemeProvider>
          <div data-testid='child'>Test Child</div>
        </ThemeProvider>
      )

      expect(screen.getByTestId('child')).toHaveTextContent('Test Child')
    })
  })
})
