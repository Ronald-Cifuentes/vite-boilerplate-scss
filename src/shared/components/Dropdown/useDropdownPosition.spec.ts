import { renderHook, act } from '@testing-library/react'
import { calculateDropdownPosition, useDropdownPosition } from './useDropdownPosition'
import { RefObject } from 'react'

const createMockDOMRect = (overrides: Partial<DOMRect> = {}): DOMRect => ({
  x: 0,
  y: 0,
  width: 100,
  height: 50,
  top: 0,
  right: 100,
  bottom: 50,
  left: 0,
  toJSON: (): object => ({}),
  ...overrides,
})

describe('calculateDropdownPosition - vertical flip', () => {
  it('should not flip when there is enough space below', () => {
    const triggerRect = createMockDOMRect({ top: 100, bottom: 150 })
    const panelRect = createMockDOMRect({ width: 160, height: 200 })

    const result = calculateDropdownPosition({
      triggerRect,
      panelRect,
      viewportWidth: 1440,
      viewportHeight: 900,
    })

    expect(result.flipVertical).toBe(false)
  })

  it('should flip vertical when not enough space below and more above', () => {
    // Trigger at bottom of viewport, panel needs 200px but only 100px available below
    const triggerRect = createMockDOMRect({ top: 750, bottom: 800 })
    const panelRect = createMockDOMRect({ height: 200 })

    const result = calculateDropdownPosition({
      triggerRect,
      panelRect,
      viewportWidth: 1440,
      viewportHeight: 900,
    })

    // 900 - 800 - 8 = 92px below
    // 750 - 8 = 742px above
    // 92 < 200 AND 742 > 92 => flip
    expect(result.flipVertical).toBe(true)
  })

  it('should not flip vertical when there is less space above than below', () => {
    // Near top of viewport
    const triggerRect = createMockDOMRect({ top: 50, bottom: 100 })
    const panelRect = createMockDOMRect({ height: 200 })

    const result = calculateDropdownPosition({
      triggerRect,
      panelRect,
      viewportWidth: 1440,
      viewportHeight: 900,
    })

    // 900 - 100 - 8 = 792px below
    // 50 - 8 = 42px above
    // 200 > 792 is false, so no flip needed anyway
    expect(result.flipVertical).toBe(false)
  })
})

describe('calculateDropdownPosition - horizontal flip', () => {
  it('should not flip horizontal when panel fits', () => {
    const triggerRect = createMockDOMRect({ left: 100 })
    const panelRect = createMockDOMRect({ width: 160 })

    const result = calculateDropdownPosition({
      triggerRect,
      panelRect,
      viewportWidth: 1440,
      viewportHeight: 900,
    })

    // 100 + 160 = 260 < 1440 - 8 = 1432
    expect(result.flipHorizontal).toBe(false)
  })

  it('should flip horizontal when right edge would overflow', () => {
    // Trigger near right edge
    const triggerRect = createMockDOMRect({ left: 1350 })
    const panelRect = createMockDOMRect({ width: 160 })

    const result = calculateDropdownPosition({
      triggerRect,
      panelRect,
      viewportWidth: 1440,
      viewportHeight: 900,
    })

    // 1350 + 160 = 1510 > 1440 - 8 = 1432
    expect(result.flipHorizontal).toBe(true)
  })
})

describe('calculateDropdownPosition - edge cases', () => {
  it('should handle mobile viewport (375px)', () => {
    // Trigger in middle of mobile screen
    const triggerRect = createMockDOMRect({ left: 200, top: 500, bottom: 550 })
    const panelRect = createMockDOMRect({ width: 200, height: 150 })

    const result = calculateDropdownPosition({
      triggerRect,
      panelRect,
      viewportWidth: 375,
      viewportHeight: 667,
    })

    // 200 + 200 = 400 > 375 - 8 = 367 => flip horizontal
    expect(result.flipHorizontal).toBe(true)
    // 667 - 550 - 8 = 109 < 150 => check if more above
    // 500 - 8 = 492 > 109 => flip vertical
    expect(result.flipVertical).toBe(true)
  })

  it('should both flip in corner case', () => {
    // Bottom-right corner
    const triggerRect = createMockDOMRect({ left: 1350, top: 800, bottom: 850 })
    const panelRect = createMockDOMRect({ width: 160, height: 200 })

    const result = calculateDropdownPosition({
      triggerRect,
      panelRect,
      viewportWidth: 1440,
      viewportHeight: 900,
    })

    expect(result.flipHorizontal).toBe(true)
    expect(result.flipVertical).toBe(true)
  })

  it('should not flip either in top-left corner', () => {
    const triggerRect = createMockDOMRect({ left: 10, top: 10, bottom: 60 })
    const panelRect = createMockDOMRect({ width: 160, height: 200 })

    const result = calculateDropdownPosition({
      triggerRect,
      panelRect,
      viewportWidth: 1440,
      viewportHeight: 900,
    })

    expect(result.flipHorizontal).toBe(false)
    expect(result.flipVertical).toBe(false)
  })
})

describe('useDropdownPosition - basic behavior', () => {
  let mockTriggerRef: RefObject<HTMLButtonElement | null>
  let mockPanelRef: RefObject<HTMLDivElement | null>
  let onPositionChange: jest.Mock
  let originalRAF: typeof window.requestAnimationFrame
  let originalInnerWidth: number
  let originalInnerHeight: number

  beforeEach(() => {
    onPositionChange = jest.fn()
    originalRAF = window.requestAnimationFrame
    originalInnerWidth = window.innerWidth
    originalInnerHeight = window.innerHeight

    // Mock requestAnimationFrame to call immediately
    window.requestAnimationFrame = (cb: FrameRequestCallback): number => {
      cb(0)
      return 0
    }

    // Set viewport dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1440, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 900, writable: true })
  })

  afterEach(() => {
    window.requestAnimationFrame = originalRAF
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, writable: true })
  })

  it('should not call onPositionChange when closed', () => {
    mockTriggerRef = { current: document.createElement('button') }
    mockPanelRef = { current: document.createElement('div') }

    renderHook(() =>
      useDropdownPosition({
        isOpen: false,
        triggerRef: mockTriggerRef,
        panelRef: mockPanelRef,
        onPositionChange,
      })
    )

    expect(onPositionChange).not.toHaveBeenCalled()
  })

  it('should call onPositionChange when open and refs are set', () => {
    const mockTrigger = document.createElement('button')
    const mockPanel = document.createElement('div')

    mockTrigger.getBoundingClientRect = (): DOMRect =>
      createMockDOMRect({ top: 100, bottom: 150, left: 100 })
    mockPanel.getBoundingClientRect = (): DOMRect => createMockDOMRect({ width: 160, height: 200 })

    mockTriggerRef = { current: mockTrigger }
    mockPanelRef = { current: mockPanel }

    renderHook(() =>
      useDropdownPosition({
        isOpen: true,
        triggerRef: mockTriggerRef,
        panelRef: mockPanelRef,
        onPositionChange,
      })
    )

    expect(onPositionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        flipVertical: expect.any(Boolean),
        flipHorizontal: expect.any(Boolean),
      })
    )
  })

  it('should not call onPositionChange if trigger ref is null', () => {
    mockTriggerRef = { current: null }
    mockPanelRef = { current: document.createElement('div') }

    renderHook(() =>
      useDropdownPosition({
        isOpen: true,
        triggerRef: mockTriggerRef,
        panelRef: mockPanelRef,
        onPositionChange,
      })
    )

    expect(onPositionChange).not.toHaveBeenCalled()
  })

  it('should not call onPositionChange if panel ref is null', () => {
    mockTriggerRef = { current: document.createElement('button') }
    mockPanelRef = { current: null }

    renderHook(() =>
      useDropdownPosition({
        isOpen: true,
        triggerRef: mockTriggerRef,
        panelRef: mockPanelRef,
        onPositionChange,
      })
    )

    expect(onPositionChange).not.toHaveBeenCalled()
  })
})

describe('useDropdownPosition - resize handling', () => {
  let mockTriggerRef: RefObject<HTMLButtonElement | null>
  let mockPanelRef: RefObject<HTMLDivElement | null>
  let onPositionChange: jest.Mock
  let originalRAF: typeof window.requestAnimationFrame
  let originalInnerWidth: number
  let originalInnerHeight: number

  beforeEach(() => {
    onPositionChange = jest.fn()
    originalRAF = window.requestAnimationFrame
    originalInnerWidth = window.innerWidth
    originalInnerHeight = window.innerHeight

    Object.defineProperty(window, 'innerWidth', { value: 1440, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 900, writable: true })
  })

  afterEach(() => {
    window.requestAnimationFrame = originalRAF
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, writable: true })
  })

  it('should recalculate on resize', () => {
    jest.useFakeTimers()
    // Re-mock RAF after useFakeTimers (which also mocks it)
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback): number => {
        cb(0)
        return 0
      })

    const mockTrigger = document.createElement('button')
    const mockPanel = document.createElement('div')

    mockTrigger.getBoundingClientRect = (): DOMRect =>
      createMockDOMRect({ top: 100, bottom: 150, left: 100 })
    mockPanel.getBoundingClientRect = (): DOMRect => createMockDOMRect({ width: 160, height: 200 })

    mockTriggerRef = { current: mockTrigger }
    mockPanelRef = { current: mockPanel }

    renderHook(() =>
      useDropdownPosition({
        isOpen: true,
        triggerRef: mockTriggerRef,
        panelRef: mockPanelRef,
        onPositionChange,
      })
    )

    // Initial call
    expect(onPositionChange).toHaveBeenCalledTimes(1)

    // Trigger resize
    act(() => {
      window.dispatchEvent(new Event('resize'))
      jest.advanceTimersByTime(150) // Debounce is 100ms
    })

    expect(onPositionChange).toHaveBeenCalledTimes(2)

    jest.useRealTimers()
  })

  it('should cleanup on unmount', () => {
    jest.useFakeTimers()

    const mockTrigger = document.createElement('button')
    const mockPanel = document.createElement('div')

    mockTrigger.getBoundingClientRect = (): DOMRect =>
      createMockDOMRect({ top: 100, bottom: 150, left: 100 })
    mockPanel.getBoundingClientRect = (): DOMRect => createMockDOMRect({ width: 160, height: 200 })

    mockTriggerRef = { current: mockTrigger }
    mockPanelRef = { current: mockPanel }

    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() =>
      useDropdownPosition({
        isOpen: true,
        triggerRef: mockTriggerRef,
        panelRef: mockPanelRef,
        onPositionChange,
      })
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    removeEventListenerSpy.mockRestore()
    jest.useRealTimers()
  })

  it('should debounce multiple resize events', () => {
    jest.useFakeTimers()
    // Re-mock RAF after useFakeTimers
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback): number => {
        cb(0)
        return 0
      })

    const mockTrigger = document.createElement('button')
    const mockPanel = document.createElement('div')

    mockTrigger.getBoundingClientRect = (): DOMRect =>
      createMockDOMRect({ top: 100, bottom: 150, left: 100 })
    mockPanel.getBoundingClientRect = (): DOMRect => createMockDOMRect({ width: 160, height: 200 })

    mockTriggerRef = { current: mockTrigger }
    mockPanelRef = { current: mockPanel }

    renderHook(() =>
      useDropdownPosition({
        isOpen: true,
        triggerRef: mockTriggerRef,
        panelRef: mockPanelRef,
        onPositionChange,
      })
    )

    // Initial call from RAF
    expect(onPositionChange).toHaveBeenCalledTimes(1)

    // Fire multiple resize events in quick succession (within 100ms debounce)
    act(() => {
      window.dispatchEvent(new Event('resize'))
      jest.advanceTimersByTime(50) // Only 50ms
      window.dispatchEvent(new Event('resize')) // This should clear the previous timeout
      jest.advanceTimersByTime(50) // Another 50ms
      window.dispatchEvent(new Event('resize')) // This should clear the previous timeout again
      jest.advanceTimersByTime(150) // Now wait for debounce to complete
    })

    // Only 2 calls total: initial + final debounced call
    expect(onPositionChange).toHaveBeenCalledTimes(2)

    jest.useRealTimers()
  })
})

describe('useDropdownPosition - synchronous layout and ResizeObserver', () => {
  let mockTriggerRef: RefObject<HTMLButtonElement | null>
  let mockPanelRef: RefObject<HTMLDivElement | null>
  let onPositionChange: jest.Mock
  let originalInnerWidth: number
  let originalInnerHeight: number
  let mockResizeObserver: jest.Mock
  let resizeObserverCallback: ResizeObserverCallback | null = null
  let resizeObserverDisconnect: jest.Mock

  beforeEach(() => {
    onPositionChange = jest.fn()
    originalInnerWidth = window.innerWidth
    originalInnerHeight = window.innerHeight

    Object.defineProperty(window, 'innerWidth', { value: 1440, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 900, writable: true })

    // Mock ResizeObserver
    resizeObserverDisconnect = jest.fn()
    mockResizeObserver = jest.fn().mockImplementation((callback: ResizeObserverCallback) => {
      resizeObserverCallback = callback
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: resizeObserverDisconnect,
      }
    })
    ;(window as unknown as { ResizeObserver: jest.Mock }).ResizeObserver = mockResizeObserver
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, writable: true })
    resizeObserverCallback = null
  })

  it('should calculate position synchronously in useLayoutEffect (before paint)', () => {
    const mockTrigger = document.createElement('button')
    const mockPanel = document.createElement('div')

    mockTrigger.getBoundingClientRect = (): DOMRect =>
      createMockDOMRect({ top: 100, bottom: 150, left: 1350 })
    mockPanel.getBoundingClientRect = (): DOMRect => createMockDOMRect({ width: 160, height: 200 })

    mockTriggerRef = { current: mockTrigger }
    mockPanelRef = { current: mockPanel }

    renderHook(() =>
      useDropdownPosition({
        isOpen: true,
        triggerRef: mockTriggerRef,
        panelRef: mockPanelRef,
        onPositionChange,
      })
    )

    // Position should be calculated synchronously - 1350 + 160 > 1440 - 8 => flip
    expect(onPositionChange).toHaveBeenCalledTimes(1)
    expect(onPositionChange).toHaveBeenCalledWith({ flipVertical: false, flipHorizontal: true })
  })

  it('should recalculate when ResizeObserver fires (simulating late layout)', () => {
    const mockTrigger = document.createElement('button')
    const mockPanel = document.createElement('div')
    let panelWidth = 0 // Simulates undersized initial measurement

    mockTrigger.getBoundingClientRect = (): DOMRect =>
      createMockDOMRect({ top: 100, bottom: 150, left: 1350 })
    mockPanel.getBoundingClientRect = (): DOMRect => createMockDOMRect({ width: panelWidth })

    mockTriggerRef = { current: mockTrigger }
    mockPanelRef = { current: mockPanel }

    renderHook(() =>
      useDropdownPosition({
        isOpen: true,
        triggerRef: mockTriggerRef,
        panelRef: mockPanelRef,
        onPositionChange,
      })
    )

    // Initial call with width=0 - no flip needed (0 fits anywhere)
    expect(onPositionChange).toHaveBeenCalledTimes(1)
    expect(onPositionChange).toHaveBeenLastCalledWith({
      flipVertical: false,
      flipHorizontal: false,
    })

    // Now panel settles to actual width - ResizeObserver fires
    panelWidth = 160
    act(() => {
      if (resizeObserverCallback) {
        resizeObserverCallback([], {} as ResizeObserver)
      }
    })

    // Second call with correct width - should flip horizontal
    // 1350 + 160 = 1510 > 1440 - 8 = 1432
    expect(onPositionChange).toHaveBeenCalledTimes(2)
    expect(onPositionChange).toHaveBeenLastCalledWith({ flipVertical: false, flipHorizontal: true })
  })

  it('should disconnect ResizeObserver on unmount', () => {
    const mockTrigger = document.createElement('button')
    const mockPanel = document.createElement('div')

    mockTrigger.getBoundingClientRect = (): DOMRect =>
      createMockDOMRect({ top: 100, bottom: 150, left: 100 })
    mockPanel.getBoundingClientRect = (): DOMRect => createMockDOMRect({ width: 160, height: 200 })

    mockTriggerRef = { current: mockTrigger }
    mockPanelRef = { current: mockPanel }

    const { unmount } = renderHook(() =>
      useDropdownPosition({
        isOpen: true,
        triggerRef: mockTriggerRef,
        panelRef: mockPanelRef,
        onPositionChange,
      })
    )

    expect(resizeObserverDisconnect).not.toHaveBeenCalled()

    unmount()

    expect(resizeObserverDisconnect).toHaveBeenCalled()

    jest.restoreAllMocks()
  })

  it('should not create ResizeObserver when panel ref is null', () => {
    mockTriggerRef = { current: document.createElement('button') }
    mockPanelRef = { current: null }

    renderHook(() =>
      useDropdownPosition({
        isOpen: true,
        triggerRef: mockTriggerRef,
        panelRef: mockPanelRef,
        onPositionChange,
      })
    )

    // ResizeObserver should not be created when panelRef.current is null
    expect(mockResizeObserver).not.toHaveBeenCalled()

    jest.restoreAllMocks()
  })
})
