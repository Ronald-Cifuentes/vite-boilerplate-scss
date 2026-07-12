/**
 * Self-test for the act() violation guard mechanism in jest-setup.ts.
 *
 * This test verifies that:
 * 1. The guard detects act() warning messages via the wrapped console.error
 * 2. The guard does NOT interfere with other console.error calls
 * 3. The detection mechanism works correctly
 *
 * The guard itself throws in afterEach, so we test the detection mechanism
 * directly rather than letting it throw (which would fail this test file).
 */
import { __actGuardTestHelpers } from '../../../jest-setup'

const {
  simulateActWarning,
  isViolationDetected,
  resetViolationState,
  setPassthroughSinkForTesting,
} = __actGuardTestHelpers

describe('act() violation guard', () => {
  // Synthetic fixtures must not pollute test output: route the guard's
  // pass-through into a mock sink for the duration of these self-tests.
  // Real suites keep the real console untouched.
  let sink: jest.Mock
  let restoreSink: () => void

  beforeEach(() => {
    sink = jest.fn()
    restoreSink = setPassthroughSinkForTesting(sink)
  })

  // We manually reset state after each test since we're testing the guard itself
  afterEach(() => {
    restoreSink()
    resetViolationState()
  })

  it('passes fixtures through to the sink (pass-through behavior verified)', () => {
    console.error('Some pass-through fixture')
    expect(sink).toHaveBeenCalledWith('Some pass-through fixture')
  })

  describe('detection mechanism', () => {
    it('detects act() warning pattern in console.error', () => {
      simulateActWarning()

      expect(isViolationDetected()).toBe(true)
    })

    it('does NOT trigger on unrelated console.error messages', () => {
      resetViolationState()

      // Simulate various non-act console.error calls
      console.error('Some other error')
      console.error('Warning: Something else happened')
      console.error('Error: Failed to load resource')

      // Should not be detected
      expect(isViolationDetected()).toBe(false)
    })

    it('resets violation state correctly', () => {
      simulateActWarning()
      expect(isViolationDetected()).toBe(true)

      resetViolationState()
      expect(isViolationDetected()).toBe(false)
    })

    it('detects variation of act warning message', () => {
      resetViolationState()

      // Different variations React might emit
      console.error(
        'Warning: An update to TestComponent inside a test was not wrapped in act(...).'
      )
      expect(isViolationDetected()).toBe(true)

      resetViolationState()
      console.error('not wrapped in act')
      expect(isViolationDetected()).toBe(true)

      resetViolationState()
      console.error('NOT WRAPPED IN ACT') // Case insensitive
      expect(isViolationDetected()).toBe(true)
    })
  })

  describe('non-interference', () => {
    it('allows ErrorBoundary console.error output', () => {
      resetViolationState()

      // Typical ErrorBoundary error output
      console.error('Error: Uncaught [Error: Test error]')
      console.error('The above error occurred in the <ThrowingChild> component')

      // These should NOT trigger act violation
      expect(isViolationDetected()).toBe(false)
    })

    it('allows React prop type warnings', () => {
      resetViolationState()

      console.error('Warning: Failed prop type: Invalid prop')

      expect(isViolationDetected()).toBe(false)
    })
  })
})
