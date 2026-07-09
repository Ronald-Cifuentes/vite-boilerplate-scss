import '@testing-library/jest-dom'
import '@testing-library/jest-dom/jest-globals'

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
