import { GPS_TIMEOUT_MS, GPS_MAXIMUM_AGE_MS, GPS_ENABLE_HIGH_ACCURACY } from '../config/providers'

export interface GpsCoords {
  readonly latitude: number
  readonly longitude: number
}

export type GpsResult =
  | { readonly success: true; readonly coords: GpsCoords }
  | { readonly success: false; readonly reason: 'denied' | 'unavailable' | 'timeout' }

/**
 * Request GPS position from browser
 * Returns coords if granted, failure reason otherwise
 */
export function requestGpsPosition(): Promise<GpsResult> {
  return new Promise(resolve => {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      resolve({ success: false, reason: 'unavailable' })
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          success: true,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        })
      },
      error => {
        // Map error codes to failure reasons
        const reason: 'denied' | 'unavailable' | 'timeout' =
          error.code === error.PERMISSION_DENIED
            ? 'denied'
            : error.code === error.TIMEOUT
              ? 'timeout'
              : 'unavailable'
        resolve({ success: false, reason })
      },
      {
        timeout: GPS_TIMEOUT_MS,
        maximumAge: GPS_MAXIMUM_AGE_MS,
        enableHighAccuracy: GPS_ENABLE_HIGH_ACCURACY,
      }
    )
  })
}
