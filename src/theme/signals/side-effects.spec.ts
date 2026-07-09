import { syncDataTheme } from './side-effects'

describe('Theme Side Effects', () => {
  describe('syncDataTheme', () => {
    it('sets data-theme attribute to light', () => {
      syncDataTheme('light')
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    it('sets data-theme attribute to dark', () => {
      syncDataTheme('dark')
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })
  })
})
