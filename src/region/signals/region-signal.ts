import { signal, computed } from '@preact/signals-react'
import type { SupportedRegion } from '../types/Region'
import { DEFAULT_REGION, SUPPORTED_REGIONS, REGION_METADATA } from '../config/regions'

/**
 * Singleton signal carrying the active region for the whole app.
 */
export const regionSignal = signal<SupportedRegion>(DEFAULT_REGION)

/** Derived state: metadata for current region */
export const regionMetadataSignal = computed(() => REGION_METADATA[regionSignal.value])

/**
 * Update the active region.
 */
export function setRegion(region: SupportedRegion): void {
  regionSignal.value = region
}

/**
 * Cycle to the next region in the supported list.
 */
export function cycleRegion(): void {
  const currentIndex = SUPPORTED_REGIONS.indexOf(regionSignal.value)
  const nextIndex = (currentIndex + 1) % SUPPORTED_REGIONS.length
  regionSignal.value = SUPPORTED_REGIONS[nextIndex]
}

/**
 * Format a date using the current region's locale.
 */
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const metadata = REGION_METADATA[regionSignal.value]
  return new Intl.DateTimeFormat(metadata.dateLocale, options).format(date)
}

/**
 * Format a number using the current region's locale.
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  const metadata = REGION_METADATA[regionSignal.value]
  return new Intl.NumberFormat(metadata.numberLocale, options).format(value)
}
