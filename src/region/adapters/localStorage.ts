import type { SupportedRegion } from '../types/Region'
import { REGION_STORAGE_KEY, isValidRegion } from '../config/regions'

export function persistRegion(region: SupportedRegion): void {
  try {
    localStorage.setItem(REGION_STORAGE_KEY, region)
  } catch {
    // localStorage unavailable - silent fail
  }
}

export function loadPersistedRegion(): SupportedRegion | null {
  try {
    const stored = localStorage.getItem(REGION_STORAGE_KEY)
    if (stored && isValidRegion(stored)) {
      return stored
    }
  } catch {
    // localStorage unavailable
  }
  return null
}

export function clearPersistedRegion(): void {
  try {
    localStorage.removeItem(REGION_STORAGE_KEY)
  } catch {
    // localStorage unavailable - silent fail
  }
}
