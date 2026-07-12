import { signal } from '@preact/signals-react'

/**
 * Mobile menu state signals (ADR-0012).
 * Using signals per codebase pattern instead of useState.
 */
export const mobileMenuOpenSignal = signal<boolean>(false)
export const expandedItemSignal = signal<string | null>(null)

export function toggleMobileMenu(): void {
  mobileMenuOpenSignal.value = !mobileMenuOpenSignal.value
}

export function closeMobileMenu(): void {
  mobileMenuOpenSignal.value = false
  expandedItemSignal.value = null
}

export function openMobileMenu(): void {
  mobileMenuOpenSignal.value = true
}

export function setExpandedItem(item: string | null): void {
  expandedItemSignal.value = item
}

export function toggleExpandedItem(item: string): void {
  expandedItemSignal.value = expandedItemSignal.value === item ? null : item
}

export function resetMobileMenuState(): void {
  mobileMenuOpenSignal.value = false
  expandedItemSignal.value = null
}
