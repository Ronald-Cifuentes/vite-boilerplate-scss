import {
  languageAnnouncementSignal,
  themeAnnouncementSignal,
  countryAnnouncementSignal,
  setLanguageAnnouncement,
  setThemeAnnouncement,
  setCountryAnnouncement,
  resetAnnouncements,
} from './announcement-signal'

describe('announcement-signal', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    resetAnnouncements()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('setLanguageAnnouncement', () => {
    it('sets the language announcement signal', () => {
      setLanguageAnnouncement('Language changed')

      jest.advanceTimersByTime(10)

      expect(languageAnnouncementSignal.value).toBe('Language changed')
    })

    it('clears before setting (for consecutive identical messages)', () => {
      languageAnnouncementSignal.value = 'Previous'

      setLanguageAnnouncement('New')

      // Immediately after call, should be empty
      expect(languageAnnouncementSignal.value).toBe('')

      // After timeout, should have new value
      jest.advanceTimersByTime(10)
      expect(languageAnnouncementSignal.value).toBe('New')
    })
  })

  describe('setThemeAnnouncement', () => {
    it('sets the theme announcement signal', () => {
      setThemeAnnouncement('Theme changed')

      jest.advanceTimersByTime(10)

      expect(themeAnnouncementSignal.value).toBe('Theme changed')
    })

    it('clears before setting', () => {
      themeAnnouncementSignal.value = 'Previous'

      setThemeAnnouncement('New')

      expect(themeAnnouncementSignal.value).toBe('')

      jest.advanceTimersByTime(10)
      expect(themeAnnouncementSignal.value).toBe('New')
    })
  })

  describe('setCountryAnnouncement', () => {
    it('sets the country announcement signal', () => {
      setCountryAnnouncement('Country changed')

      jest.advanceTimersByTime(10)

      expect(countryAnnouncementSignal.value).toBe('Country changed')
    })

    it('clears before setting', () => {
      countryAnnouncementSignal.value = 'Previous'

      setCountryAnnouncement('New')

      expect(countryAnnouncementSignal.value).toBe('')

      jest.advanceTimersByTime(10)
      expect(countryAnnouncementSignal.value).toBe('New')
    })
  })

  describe('resetAnnouncements', () => {
    it('resets all announcement signals', () => {
      languageAnnouncementSignal.value = 'Lang'
      themeAnnouncementSignal.value = 'Theme'
      countryAnnouncementSignal.value = 'Country'

      resetAnnouncements()

      expect(languageAnnouncementSignal.value).toBe('')
      expect(themeAnnouncementSignal.value).toBe('')
      expect(countryAnnouncementSignal.value).toBe('')
    })
  })
})
