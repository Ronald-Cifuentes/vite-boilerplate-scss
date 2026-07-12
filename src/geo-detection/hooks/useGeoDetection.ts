import { useEffect, useRef } from 'react'
import { LOCALE_STORAGE_KEY } from '../../i18n/config/locales'
import { REGION_STORAGE_KEY } from '../../region/config/regions'
import { CURRENCY_STORAGE_KEY } from '../../currency/config/currencies'
import { userOverriddenSignal } from '../../currency/signals/currency-signal'

function hasStoredPrefs(): boolean {
  if (typeof localStorage === 'undefined') return false
  return (
    localStorage.getItem(LOCALE_STORAGE_KEY) !== null ||
    localStorage.getItem(REGION_STORAGE_KEY) !== null ||
    localStorage.getItem(CURRENCY_STORAGE_KEY) !== null
  )
}

function hasUserMadeChoices(): boolean {
  return hasStoredPrefs() || userOverriddenSignal.value
}

export interface GeoDetectionApplied {
  locale: string
  region: string
  currency: string
  source: string
}

interface UseGeoDetectionOptions {
  onDetected?: (result: GeoDetectionApplied) => void
  onAnnounce?: (message: string) => void
}

/**
 * Hook that runs geo detection on mount if no stored preferences
 * ADR-0014: detection runs only when ALL THREE prefs unset
 * Never blocks first paint - runs asynchronously after mount
 *
 * TOCTOU FIX: Re-checks that prefs are STILL unset when detection resolves.
 * If user made ANY choice during detection, the entire result is discarded.
 */
export function useGeoDetection(options: UseGeoDetectionOptions = {}): void {
  const hasRun = useRef(false)

  useEffect(() => {
    // Only run once
    if (hasRun.current) return
    hasRun.current = true

    // Skip if user has stored preferences (initial check)
    if (hasStoredPrefs()) {
      return
    }

    // Lazy load the detection module to keep it out of main bundle
    const runDetection = async (): Promise<void> => {
      try {
        const { detectGeoPreferences } = await import('../adapters/GeoDetectionAdapter')
        const result = await detectGeoPreferences()

        // If detection returned 'default' (all providers failed), don't apply anything.
        // The app will use its own defaults (from CurrencyProvider/RegionProvider).
        if (result.source === 'default') {
          return // Detection failed - let app use its built-in defaults
        }

        // TOCTOU FIX: Re-check that NO preferences were set during detection.
        // If user made ANY choice while detection was in flight, abort entirely.
        // This is atomic - we don't partially apply (e.g., locale yes, region no).
        if (hasUserMadeChoices()) {
          return // User made choices during detection - discard result
        }

        // Apply detected preferences via callback
        if (options.onDetected) {
          options.onDetected(result)
        }

        // Announce if callback provided
        if (options.onAnnounce) {
          options.onAnnounce(`Detected location: ${result.region}`)
        }
      } catch {
        // Detection failed - no action needed, app continues with defaults
      }
    }

    // Run detection asynchronously (non-blocking)
    void runDetection()
  }, [options])
}
