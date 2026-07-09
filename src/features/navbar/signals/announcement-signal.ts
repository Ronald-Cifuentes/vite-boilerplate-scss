import { signal } from '@preact/signals-react'

/**
 * Module-level signal for navbar announcements.
 * Lives at module scope so that it can be mutated from useSignalEffect callbacks.
 */
export const languageAnnouncementSignal = signal('')
export const themeAnnouncementSignal = signal('')
export const countryAnnouncementSignal = signal('')
export const currencyAnnouncementSignal = signal('')

/**
 * Clear and set language announcement (ensures SR picks up consecutive identical messages)
 */
export function setLanguageAnnouncement(message: string): void {
  languageAnnouncementSignal.value = ''
  // Use setTimeout to ensure the clear happens before the set
  setTimeout(() => {
    languageAnnouncementSignal.value = message
  }, 0)
}

/**
 * Clear and set theme announcement
 */
export function setThemeAnnouncement(message: string): void {
  themeAnnouncementSignal.value = ''
  setTimeout(() => {
    themeAnnouncementSignal.value = message
  }, 0)
}

/**
 * Clear and set country announcement
 */
export function setCountryAnnouncement(message: string): void {
  countryAnnouncementSignal.value = ''
  setTimeout(() => {
    countryAnnouncementSignal.value = message
  }, 0)
}

/**
 * Clear and set currency announcement
 */
export function setCurrencyAnnouncement(message: string): void {
  currencyAnnouncementSignal.value = ''
  setTimeout(() => {
    currencyAnnouncementSignal.value = message
  }, 0)
}

/**
 * Reset all announcements (for testing)
 */
export function resetAnnouncements(): void {
  languageAnnouncementSignal.value = ''
  themeAnnouncementSignal.value = ''
  countryAnnouncementSignal.value = ''
  currencyAnnouncementSignal.value = ''
}
