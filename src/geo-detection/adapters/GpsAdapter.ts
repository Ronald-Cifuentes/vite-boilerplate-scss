import { GPS_TIMEOUT_MS, GPS_MAXIMUM_AGE_MS, GPS_ENABLE_HIGH_ACCURACY } from '../config/providers'

export interface GpsCoords {
  readonly latitude: number
  readonly longitude: number
}

export type GpsErrorReason = 'denied' | 'unavailable' | 'timeout'

export type GpsResult =
  | { readonly success: true; readonly coords: GpsCoords }
  | { readonly success: false; readonly reason: GpsErrorReason }

/**
 * Map GeolocationPositionError code to a user-friendly reason string
 */
function mapGpsErrorToReason(error: GeolocationPositionError): GpsErrorReason {
  if (error.code === error.PERMISSION_DENIED) {
    return 'denied'
  }
  if (error.code === error.TIMEOUT) {
    return 'timeout'
  }
  return 'unavailable'
}

/**
 * Request GPS position from browser
 * Returns coords if granted, failure reason otherwise
 */
export function requestGpsPosition(): Promise<GpsResult> {
  return new Promise(resolve => {
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
        resolve({ success: false, reason: mapGpsErrorToReason(error) })
      },
      {
        timeout: GPS_TIMEOUT_MS,
        maximumAge: GPS_MAXIMUM_AGE_MS,
        enableHighAccuracy: GPS_ENABLE_HIGH_ACCURACY,
      }
    )
  })
}
