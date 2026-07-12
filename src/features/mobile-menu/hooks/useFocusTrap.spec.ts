import { renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { useFocusTrap } from './useFocusTrap'

// Shared setup for DOM elements
function createTestElements(): {
  container: HTMLDivElement
  trigger: HTMLButtonElement
  button1: HTMLButtonElement
  button2: HTMLButtonElement
  button3: HTMLButtonElement
} {
  const container = document.createElement('div')
  const trigger = document.createElement('button')
  const button1 = document.createElement('button')
  const button2 = document.createElement('button')
  const button3 = document.createElement('button')

  button1.textContent = 'First'
  button2.textContent = 'Second'
  button3.textContent = 'Third'

  container.appendChild(button1)
  container.appendChild(button2)
  container.appendChild(button3)

  return { container, trigger, button1, button2, button3 }
}

describe('useFocusTrap - basic behavior', () => {
  let container: HTMLDivElement
  let trigger: HTMLButtonElement
  let button1: HTMLButtonElement
  let button2: HTMLButtonElement
  let button3: HTMLButtonElement

  beforeEach(() => {
    const elements = createTestElements()
    container = elements.container
    trigger = elements.trigger
    button1 = elements.button1
    button2 = elements.button2
    button3 = elements.button3

    document.body.appendChild(trigger)
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(trigger)
    document.body.removeChild(container)
  })

  it('focuses first focusable element when activated', () => {
    const { result } = renderHook(() => {
      const containerRef = useRef<HTMLElement>(container)
      const triggerRef = useRef<HTMLElement>(trigger)
      useFocusTrap(containerRef, triggerRef, true)
      return { containerRef, triggerRef }
    })

    expect(result.current).toBeDefined()
    expect(document.activeElement).toBe(button1)
  })

  it('does not focus when inactive', () => {
    trigger.focus()

    renderHook(() => {
      const containerRef = useRef<HTMLElement>(container)
      const triggerRef = useRef<HTMLElement>(trigger)
      useFocusTrap(containerRef, triggerRef, false)
      return { containerRef, triggerRef }
    })

    expect(document.activeElement).toBe(trigger)
  })

  it('traps Tab at last element - wraps to first', () => {
    renderHook(() => {
      const containerRef = useRef<HTMLElement>(container)
      const triggerRef = useRef<HTMLElement>(trigger)
      useFocusTrap(containerRef, triggerRef, true)
      return { containerRef, triggerRef }
    })

    button3.focus()
    expect(document.activeElement).toBe(button3)

    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(tabEvent)

    expect(document.activeElement).toBe(button1)
  })

  it('traps Shift+Tab at first element - wraps to last', () => {
    renderHook(() => {
      const containerRef = useRef<HTMLElement>(container)
      const triggerRef = useRef<HTMLElement>(trigger)
      useFocusTrap(containerRef, triggerRef, true)
      return { containerRef, triggerRef }
    })

    // Focus is on button1 by default when activated
    expect(document.activeElement).toBe(button1)

    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(shiftTabEvent)

    expect(document.activeElement).toBe(button3)
  })

  it('allows normal Tab navigation between middle elements', () => {
    renderHook(() => {
      const containerRef = useRef<HTMLElement>(container)
      const triggerRef = useRef<HTMLElement>(trigger)
      useFocusTrap(containerRef, triggerRef, true)
      return { containerRef, triggerRef }
    })

    // Focus on middle element
    button2.focus()
    expect(document.activeElement).toBe(button2)

    // Tab should not prevent default (normal behavior)
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(tabEvent)

    // Focus should still be on button2 (browser handles focus, we just don't prevent)
    expect(document.activeElement).toBe(button2)
  })

  it('ignores non-Tab keys', () => {
    renderHook(() => {
      const containerRef = useRef<HTMLElement>(container)
      const triggerRef = useRef<HTMLElement>(trigger)
      useFocusTrap(containerRef, triggerRef, true)
      return { containerRef, triggerRef }
    })

    // Focus is on button1 by default
    expect(document.activeElement).toBe(button1)

    // Other key should be ignored
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(enterEvent)

    // Focus unchanged
    expect(document.activeElement).toBe(button1)
  })

  it('handles empty container gracefully', () => {
    const emptyContainer = document.createElement('div')
    document.body.appendChild(emptyContainer)

    expect(() => {
      renderHook(() => {
        const containerRef = useRef<HTMLElement>(emptyContainer)
        const triggerRef = useRef<HTMLElement>(trigger)
        useFocusTrap(containerRef, triggerRef, true)
      })
    }).not.toThrow()

    document.body.removeChild(emptyContainer)
  })

  it('handles null container ref', () => {
    expect(() => {
      renderHook(() => {
        const containerRef = useRef<HTMLElement | null>(null)
        const triggerRef = useRef<HTMLElement>(trigger)
        useFocusTrap(containerRef, triggerRef, true)
      })
    }).not.toThrow()
  })
})

describe('useFocusTrap - focus return on deactivation', () => {
  let container: HTMLDivElement
  let trigger: HTMLButtonElement
  let button1: HTMLButtonElement

  beforeEach(() => {
    const elements = createTestElements()
    container = elements.container
    trigger = elements.trigger
    button1 = elements.button1

    document.body.appendChild(trigger)
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(trigger)
    document.body.removeChild(container)
  })

  it('returns focus to inline control on deactivation when available', () => {
    // Create a mock inline control with correct test ID (language trigger)
    const inlineButton = document.createElement('button')
    inlineButton.setAttribute('data-testid', 'app-navbar-language-trigger')
    inlineButton.textContent = 'Language'
    // Mock visibility - JSDOM doesn't compute offsetParent properly
    Object.defineProperty(inlineButton, 'offsetParent', { value: document.body })
    document.body.appendChild(inlineButton)

    const { rerender } = renderHook(
      ({ isActive }) => {
        const containerRef = useRef<HTMLElement>(container)
        const triggerRef = useRef<HTMLElement>(trigger)
        useFocusTrap(containerRef, triggerRef, isActive)
        return { containerRef, triggerRef }
      },
      { initialProps: { isActive: true } }
    )

    expect(document.activeElement).toBe(button1)

    rerender({ isActive: false })

    // Should focus inline control, not trigger
    expect(document.activeElement).toBe(inlineButton)

    document.body.removeChild(inlineButton)
  })

  it('skips hidden inline controls when finding focus target', () => {
    // Create inline controls with correct test IDs - first hidden, second visible
    const hiddenButton = document.createElement('button')
    hiddenButton.setAttribute('data-testid', 'app-navbar-language-trigger')
    hiddenButton.textContent = 'Language'
    hiddenButton.style.display = 'none' // Hidden control
    // Mock hidden element - offsetParent is null for hidden elements
    Object.defineProperty(hiddenButton, 'offsetParent', { value: null })
    Object.defineProperty(hiddenButton, 'getBoundingClientRect', {
      value: () => ({ width: 0, height: 0 }),
    })
    document.body.appendChild(hiddenButton)

    const visibleButton = document.createElement('button')
    visibleButton.setAttribute('data-testid', 'app-navbar-country-trigger')
    visibleButton.textContent = 'Country'
    // Mock visible element
    Object.defineProperty(visibleButton, 'offsetParent', { value: document.body })
    document.body.appendChild(visibleButton)

    const { rerender } = renderHook(
      ({ isActive }) => {
        const containerRef = useRef<HTMLElement>(container)
        const triggerRef = useRef<HTMLElement>(trigger)
        useFocusTrap(containerRef, triggerRef, isActive)
        return { containerRef, triggerRef }
      },
      { initialProps: { isActive: true } }
    )

    expect(document.activeElement).toBe(button1)

    rerender({ isActive: false })

    // Should skip hidden button and focus visible one
    expect(document.activeElement).toBe(visibleButton)

    document.body.removeChild(hiddenButton)
    document.body.removeChild(visibleButton)
  })

  it('falls back to trigger when all inline controls are hidden', () => {
    // Create an inline control that is hidden
    const hiddenButton = document.createElement('button')
    hiddenButton.setAttribute('data-testid', 'app-navbar-language-trigger')
    hiddenButton.textContent = 'Language'
    hiddenButton.style.display = 'none' // All controls hidden
    // Mock hidden element - offsetParent is null for hidden elements
    Object.defineProperty(hiddenButton, 'offsetParent', { value: null })
    Object.defineProperty(hiddenButton, 'getBoundingClientRect', {
      value: () => ({ width: 0, height: 0 }),
    })
    document.body.appendChild(hiddenButton)

    const { rerender } = renderHook(
      ({ isActive }) => {
        const containerRef = useRef<HTMLElement>(container)
        const triggerRef = useRef<HTMLElement>(trigger)
        useFocusTrap(containerRef, triggerRef, isActive)
        return { containerRef, triggerRef }
      },
      { initialProps: { isActive: true } }
    )

    expect(document.activeElement).toBe(button1)

    rerender({ isActive: false })

    // Should fall back to trigger since no visible inline controls
    expect(document.activeElement).toBe(trigger)

    document.body.removeChild(hiddenButton)
  })

  it('detects visible fixed-positioned element via getBoundingClientRect', () => {
    // Fixed elements have offsetParent === null, so we check dimensions
    const fixedButton = document.createElement('button')
    fixedButton.setAttribute('data-testid', 'app-navbar-language-trigger')
    fixedButton.textContent = 'Language'
    fixedButton.style.position = 'fixed'
    // Mock fixed element - offsetParent null but has dimensions
    Object.defineProperty(fixedButton, 'offsetParent', { value: null })
    Object.defineProperty(fixedButton, 'getBoundingClientRect', {
      value: () => ({ width: 100, height: 40, top: 0, left: 0, bottom: 40, right: 100 }),
    })
    document.body.appendChild(fixedButton)

    const { rerender } = renderHook(
      ({ isActive }) => {
        const containerRef = useRef<HTMLElement>(container)
        const triggerRef = useRef<HTMLElement>(trigger)
        useFocusTrap(containerRef, triggerRef, isActive)
        return { containerRef, triggerRef }
      },
      { initialProps: { isActive: true } }
    )

    expect(document.activeElement).toBe(button1)

    rerender({ isActive: false })

    // Should focus the fixed button since it has dimensions
    expect(document.activeElement).toBe(fixedButton)

    document.body.removeChild(fixedButton)
  })

  it('returns focus to trigger when no inline controls available', () => {
    const { rerender } = renderHook(
      ({ isActive }) => {
        const containerRef = useRef<HTMLElement>(container)
        const triggerRef = useRef<HTMLElement>(trigger)
        useFocusTrap(containerRef, triggerRef, isActive)
        return { containerRef, triggerRef }
      },
      { initialProps: { isActive: true } }
    )

    expect(document.activeElement).toBe(button1)

    rerender({ isActive: false })

    // Falls back to trigger
    expect(document.activeElement).toBe(trigger)
  })
})
