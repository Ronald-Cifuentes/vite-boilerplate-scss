import { renderHook, waitFor } from '@testing-library/react'
import { useGeoDetection } from './useGeoDetection'
import { LOCALE_STORAGE_KEY } from '../../i18n/config/locales'
import { REGION_STORAGE_KEY } from '../../region/config/regions'
import { CURRENCY_STORAGE_KEY } from '../../currency/config/currencies'
import { userOverriddenSignal } from '../../currency/signals/currency-signal'
import * as GeoDetectionAdapter from '../adapters/GeoDetectionAdapter'

// Mock the adapter
jest.mock('../adapters/GeoDetectionAdapter')

const mockDetect = GeoDetectionAdapter.detectGeoPreferences as jest.Mock

describe('useGeoDetection - skip detection when prefs stored', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    userOverriddenSignal.value = false
  })

  it('skips detection when locale is stored', async () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'es')
    const onDetected = jest.fn()

    renderHook(() => useGeoDetection({ onDetected }))

    await waitFor(() => {
      expect(onDetected).not.toHaveBeenCalled()
    })
  })

  it('skips detection when region is stored', async () => {
    localStorage.setItem(REGION_STORAGE_KEY, 'MX')
    const onDetected = jest.fn()

    renderHook(() => useGeoDetection({ onDetected }))

    await waitFor(() => {
      expect(onDetected).not.toHaveBeenCalled()
    })
  })

  it('skips detection when currency is stored', async () => {
    localStorage.setItem(CURRENCY_STORAGE_KEY, 'EUR')
    const onDetected = jest.fn()

    renderHook(() => useGeoDetection({ onDetected }))

    await waitFor(() => {
      expect(onDetected).not.toHaveBeenCalled()
    })
  })
})

describe('useGeoDetection - detection and callbacks', () => {
  const originalLocalStorage = window.localStorage

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    userOverriddenSignal.value = false
  })

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', { value: originalLocalStorage })
  })

  it('runs detection when no prefs stored and calls onDetected', async () => {
    mockDetect.mockResolvedValue({
      locale: 'es',
      region: 'CO',
      currency: 'COP',
      source: 'ip',
    })

    const onDetected = jest.fn()

    renderHook(() => useGeoDetection({ onDetected }))

    await waitFor(() => {
      expect(onDetected).toHaveBeenCalledWith({
        locale: 'es',
        region: 'CO',
        currency: 'COP',
        source: 'ip',
      })
    })
  })

  it('calls onAnnounce with structured i18n data when detection succeeds', async () => {
    mockDetect.mockResolvedValue({
      locale: 'ja',
      region: 'JP',
      currency: 'JPY',
      source: 'gps',
    })

    const onAnnounce = jest.fn()

    renderHook(() => useGeoDetection({ onAnnounce }))

    await waitFor(() => {
      expect(onAnnounce).toHaveBeenCalledWith({
        key: 'a11y.locationDetected',
        region: 'JP',
      })
    })
  })

  it('does not call onDetected or onAnnounce when source is default (detection failed)', async () => {
    mockDetect.mockResolvedValue({
      locale: 'en',
      region: 'US',
      currency: 'USD',
      source: 'default',
    })

    const onDetected = jest.fn()
    const onAnnounce = jest.fn()

    renderHook(() => useGeoDetection({ onDetected, onAnnounce }))

    // Wait for async detection to complete
    await new Promise(resolve => setTimeout(resolve, 50))

    // Neither callback should be called when detection returns 'default'
    expect(onDetected).not.toHaveBeenCalled()
    expect(onAnnounce).not.toHaveBeenCalled()
  })

  it('handles detection failure gracefully', async () => {
    mockDetect.mockRejectedValue(new Error('Network error'))

    const onDetected = jest.fn()

    // Should not throw
    renderHook(() => useGeoDetection({ onDetected }))

    await waitFor(
      () => {
        expect(onDetected).not.toHaveBeenCalled()
      },
      { timeout: 1000 }
    )
  })

  it('only runs detection once', async () => {
    mockDetect.mockResolvedValue({
      locale: 'es',
      region: 'CO',
      currency: 'COP',
      source: 'ip',
    })

    const onDetected = jest.fn()

    const { rerender } = renderHook(() => useGeoDetection({ onDetected }))

    await waitFor(() => {
      expect(onDetected).toHaveBeenCalledTimes(1)
    })

    // Rerender should not trigger another detection
    rerender()

    await waitFor(() => {
      expect(onDetected).toHaveBeenCalledTimes(1)
    })
  })

  it('works without any options', async () => {
    mockDetect.mockResolvedValue({
      locale: 'es',
      region: 'CO',
      currency: 'COP',
      source: 'ip',
    })

    // Should not throw when called without options
    renderHook(() => useGeoDetection())

    await waitFor(() => {
      expect(mockDetect).toHaveBeenCalled()
    })
  })

  it('handles undefined localStorage gracefully', async () => {
    // Simulate localStorage being undefined (SSR)
    Object.defineProperty(window, 'localStorage', {
      value: undefined,
      configurable: true,
    })

    // Use a real detection source (not 'default') to verify onDetected is called
    mockDetect.mockResolvedValue({
      locale: 'es',
      region: 'CO',
      currency: 'COP',
      source: 'ip',
    })

    const onDetected = jest.fn()

    // Should run detection since localStorage is undefined
    renderHook(() => useGeoDetection({ onDetected }))

    await waitFor(() => {
      expect(onDetected).toHaveBeenCalled()
    })
  })
})

describe('useGeoDetection - TOCTOU fix: user makes choice during slow detection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    userOverriddenSignal.value = false
  })

  it('discards detection result if user set currency during detection', async () => {
    // Use a deferred promise to control when detection completes
    let resolveDetection: () => void
    const detectionPromise = new Promise<void>(resolve => {
      resolveDetection = resolve
    })

    mockDetect.mockImplementation(async () => {
      // Wait until test explicitly resolves
      await detectionPromise
      return {
        locale: 'es',
        region: 'CO',
        currency: 'COP',
        source: 'ip',
      }
    })

    const onDetected = jest.fn()

    renderHook(() => useGeoDetection({ onDetected }))

    // Give the hook time to start detection (yield to event loop)
    await new Promise(resolve => setTimeout(resolve, 0))

    // User sets currency while detection is in flight
    userOverriddenSignal.value = true

    // Now let detection complete
    resolveDetection!()

    // Wait a tick for callbacks to fire
    await new Promise(resolve => setTimeout(resolve, 10))

    // Detection should NOT have called onDetected due to TOCTOU abort
    expect(onDetected).not.toHaveBeenCalled()
  })

  it('discards detection result if user set locale during detection', async () => {
    let resolveDetection: () => void
    const detectionPromise = new Promise<void>(resolve => {
      resolveDetection = resolve
    })

    mockDetect.mockImplementation(async () => {
      await detectionPromise
      return {
        locale: 'es',
        region: 'CO',
        currency: 'COP',
        source: 'ip',
      }
    })

    const onDetected = jest.fn()

    renderHook(() => useGeoDetection({ onDetected }))

    await new Promise(resolve => setTimeout(resolve, 0))

    // User sets locale while detection is in flight
    localStorage.setItem(LOCALE_STORAGE_KEY, 'ja')

    // Now let detection complete
    resolveDetection!()

    await new Promise(resolve => setTimeout(resolve, 10))

    // Detection result should be discarded - atomic: all or nothing
    expect(onDetected).not.toHaveBeenCalled()
  })

  it('discards detection result if ANY pref was set during detection (atomic)', async () => {
    let resolveDetection: () => void
    const detectionPromise = new Promise<void>(resolve => {
      resolveDetection = resolve
    })

    mockDetect.mockImplementation(async () => {
      await detectionPromise
      return {
        locale: 'es',
        region: 'CO',
        currency: 'COP',
        source: 'ip',
      }
    })

    const onDetected = jest.fn()

    renderHook(() => useGeoDetection({ onDetected }))

    await new Promise(resolve => setTimeout(resolve, 0))

    // User only sets region - should still abort ALL detection results
    localStorage.setItem(REGION_STORAGE_KEY, 'GB')

    // Now let detection complete
    resolveDetection!()

    await new Promise(resolve => setTimeout(resolve, 10))

    // Detection result should be discarded entirely
    expect(onDetected).not.toHaveBeenCalled()
  })

  it('applies detection result when user made no choices', async () => {
    mockDetect.mockResolvedValue({
      locale: 'es',
      region: 'CO',
      currency: 'COP',
      source: 'ip',
    })

    const onDetected = jest.fn()

    renderHook(() => useGeoDetection({ onDetected }))

    // User makes no changes - detection should apply
    await waitFor(() => {
      expect(onDetected).toHaveBeenCalledWith({
        locale: 'es',
        region: 'CO',
        currency: 'COP',
        source: 'ip',
      })
    })
  })
})
