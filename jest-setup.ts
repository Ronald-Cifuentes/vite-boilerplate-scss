import '@testing-library/jest-dom'
import '@testing-library/jest-dom/jest-globals'

// Mock Element.scrollIntoView for tests (needed by mobile menu focus handling)
// CONTRACTS §17: scrollIntoView called on focus for keyboard navigation
Element.prototype.scrollIntoView = jest.fn()

// Mock window.matchMedia for tests that need it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock requestAnimationFrame to run synchronously in tests
// This is needed because JSDOM's RAF is async, but in tests we need
// focus management to happen immediately for assertions (FE-005 fix)
let rafId = 0
window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  rafId += 1
  callback(rafId)
  return rafId
}

window.cancelAnimationFrame = (): void => {
  // No-op in tests since RAF runs synchronously
}

// Mock ResizeObserver for tests (needed by useDropdownPosition)
class MockResizeObserver {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

// =============================================================================
// ACT() VIOLATION GUARD
// =============================================================================
// This guard FAILS tests that trigger React's "not wrapped in act()" warnings.
// It is narrowly targeted: ONLY act-warnings trigger failure; all other
// console.error calls pass through untouched (e.g., ErrorBoundary tests
// legitimately produce React error logs).
//
// The guard records violations during test execution and throws in afterEach,
// causing the specific test to fail with a clear message.
// =============================================================================

const ACT_WARNING_PATTERN = /not wrapped in act/i

// Track act violations per test
let actViolationDetected = false
let actViolationMessage = ''

// Store original console.error
const originalConsoleError = console.error

// Pass-through sink: the real console.error in normal runs. The guard's own
// self-tests swap in a mock so their SYNTHETIC warning fixtures don't pollute
// test output — real diagnostics in real suites always pass through.
let passthroughSink: (...args: unknown[]) => void = originalConsoleError

// Wrap console.error to detect act() violations
console.error = function (...args: unknown[]): void {
  const message = args.map(String).join(' ')

  if (ACT_WARNING_PATTERN.test(message)) {
    actViolationDetected = true
    actViolationMessage = message.slice(0, 500) // Truncate for readability
  }

  // Always pass through (preserves ErrorBoundary test output); sink is
  // swappable ONLY by the guard's self-tests (see __actGuardTestHelpers)
  passthroughSink.apply(console, args)
}

// Reset violation state before each test
beforeEach(() => {
  actViolationDetected = false
  actViolationMessage = ''
})

// Fail test if act violation was detected
afterEach(() => {
  if (actViolationDetected) {
    const error = new Error(
      `act(...) violation detected — wrap state updates in act(); see src/shared/test/act-utils.ts\n\n` +
        `Violation message: ${actViolationMessage}`
    )
    // Reset for next test
    actViolationDetected = false
    actViolationMessage = ''
    throw error
  }
})

// Export for testing the guard itself
export const __actGuardTestHelpers = {
  /** Trigger a fake act warning - for testing the guard mechanism */
  simulateActWarning: (): void => {
    console.error('Warning: An update to Component inside a test was not wrapped in act(...)')
  },
  /** Check if violation was detected - for testing the guard */
  isViolationDetected: (): boolean => actViolationDetected,
  /** Reset violation state - for testing the guard */
  resetViolationState: (): void => {
    actViolationDetected = false
    actViolationMessage = ''
  },
  /**
   * Swap the pass-through sink (guard self-tests ONLY — keeps synthetic
   * fixtures out of the console). Returns a restore function.
   */
  setPassthroughSinkForTesting: (sink: (...args: unknown[]) => void): (() => void) => {
    const previous = passthroughSink
    passthroughSink = sink
    return (): void => {
      passthroughSink = previous
    }
  },
}
