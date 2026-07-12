import { render, screen, fireEvent, act } from '@testing-library/react'
import { ErrorBoundary, ErrorBoundaryCore } from './ErrorBoundary'
import { localeSignal } from '../../../i18n/signals/locale-signal'

import type { ReactElement } from 'react'

// Child component that throws on demand
const ThrowingChild = ({ shouldThrow }: { shouldThrow: boolean }): ReactElement => {
  if (shouldThrow) throw new Error('Test error')
  return <div data-testid='child'>Child content</div>
}

describe('ErrorBoundary', () => {
  const originalError = console.error

  beforeEach(() => {
    // Suppress React error boundary console output during tests
    console.error = jest.fn()
    act(() => {
      localeSignal.value = 'en'
    })
  })

  afterEach(() => {
    console.error = originalError
  })

  describe('Given children render without error', () => {
    it('Then children are displayed', () => {
      render(
        <ErrorBoundary>
          <ThrowingChild shouldThrow={false} />
        </ErrorBoundary>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })
  })

  describe('Given a child throws an error', () => {
    it('Then the fallback UI is rendered', () => {
      render(
        <ErrorBoundary>
          <ThrowingChild shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('Error')
    })

    it('Then the retry button is present', () => {
      render(
        <ErrorBoundary>
          <ThrowingChild shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    it('When retry button is clicked, Then it is interactive', () => {
      render(
        <ErrorBoundary>
          <ThrowingChild shouldThrow={true} />
        </ErrorBoundary>
      )
      const button = screen.getByRole('button', { name: /retry/i })
      expect(button).toBeEnabled()
      expect(() => fireEvent.click(button)).not.toThrow()
    })
  })

  describe('Given Spanish locale (eager-loaded)', () => {
    it('Then fallback shows Spanish text', () => {
      // Set locale BEFORE render to avoid mid-render signal mutation
      act(() => {
        localeSignal.value = 'es'
      })
      render(
        <ErrorBoundary>
          <ThrowingChild shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(screen.getByRole('alert')).toHaveTextContent('Error')
      expect(screen.getByRole('button')).toHaveTextContent('Reintentar')
    })
  })

  describe('Given CJK locales (lazy-loaded)', () => {
    // zh and ja are lazy-loaded - at sync render time, they fall back to English
    // The error boundary correctly shows English hardcoded fallback when i18n
    // chunk hasn't loaded yet, which is the boundary-of-last-resort behavior

    it('zh locale falls back to English before chunk loads', () => {
      act(() => {
        localeSignal.value = 'zh'
      })
      render(
        <ErrorBoundary>
          <ThrowingChild shouldThrow={true} />
        </ErrorBoundary>
      )
      // Falls back to English since zh chunk isn't loaded synchronously
      expect(screen.getByRole('alert')).toHaveTextContent('Error')
    })

    it('ja locale falls back to English before chunk loads', () => {
      act(() => {
        localeSignal.value = 'ja'
      })
      render(
        <ErrorBoundary>
          <ThrowingChild shouldThrow={true} />
        </ErrorBoundary>
      )
      // Falls back to English since ja chunk isn't loaded synchronously
      expect(screen.getByRole('alert')).toHaveTextContent('Error')
    })
  })

  describe('ErrorBoundaryCore fallback branches', () => {
    // Test the hardcoded fallback branches when no translations are provided
    it('uses hardcoded fallback when props undefined', () => {
      render(
        <ErrorBoundaryCore>
          <ThrowingChild shouldThrow={true} />
        </ErrorBoundaryCore>
      )
      expect(screen.getByRole('alert')).toHaveTextContent('!')
      expect(screen.getByRole('button')).toHaveTextContent('!')
    })

    it('uses provided title when prop is defined', () => {
      render(
        <ErrorBoundaryCore t='Custom Error'>
          <ThrowingChild shouldThrow={true} />
        </ErrorBoundaryCore>
      )
      expect(screen.getByRole('alert')).toHaveTextContent('Custom Error')
    })

    it('uses provided button text when prop is defined', () => {
      render(
        <ErrorBoundaryCore b='Try Again'>
          <ThrowingChild shouldThrow={true} />
        </ErrorBoundaryCore>
      )
      expect(screen.getByRole('button')).toHaveTextContent('Try Again')
    })
  })
})
