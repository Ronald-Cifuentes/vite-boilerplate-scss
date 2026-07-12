import {
  mobileMenuOpenSignal,
  expandedItemSignal,
  toggleMobileMenu,
  closeMobileMenu,
  openMobileMenu,
  setExpandedItem,
  toggleExpandedItem,
  resetMobileMenuState,
} from './mobile-menu-signal'

describe('mobile-menu-signal', () => {
  beforeEach(() => {
    resetMobileMenuState()
  })

  afterEach(() => {
    resetMobileMenuState()
  })

  describe('mobileMenuOpenSignal', () => {
    it('starts as false', () => {
      expect(mobileMenuOpenSignal.value).toBe(false)
    })
  })

  describe('expandedItemSignal', () => {
    it('starts as null', () => {
      expect(expandedItemSignal.value).toBeNull()
    })
  })

  describe('toggleMobileMenu', () => {
    it('toggles from false to true', () => {
      toggleMobileMenu()
      expect(mobileMenuOpenSignal.value).toBe(true)
    })

    it('toggles from true to false', () => {
      mobileMenuOpenSignal.value = true
      toggleMobileMenu()
      expect(mobileMenuOpenSignal.value).toBe(false)
    })
  })

  describe('closeMobileMenu', () => {
    it('sets menu to closed', () => {
      mobileMenuOpenSignal.value = true
      closeMobileMenu()
      expect(mobileMenuOpenSignal.value).toBe(false)
    })

    it('clears expanded item', () => {
      expandedItemSignal.value = 'language'
      closeMobileMenu()
      expect(expandedItemSignal.value).toBeNull()
    })
  })

  describe('openMobileMenu', () => {
    it('sets menu to open', () => {
      openMobileMenu()
      expect(mobileMenuOpenSignal.value).toBe(true)
    })
  })

  describe('setExpandedItem', () => {
    it('sets expanded item', () => {
      setExpandedItem('language')
      expect(expandedItemSignal.value).toBe('language')
    })

    it('can set to null', () => {
      expandedItemSignal.value = 'language'
      setExpandedItem(null)
      expect(expandedItemSignal.value).toBeNull()
    })
  })

  describe('toggleExpandedItem', () => {
    it('expands item when collapsed', () => {
      toggleExpandedItem('language')
      expect(expandedItemSignal.value).toBe('language')
    })

    it('collapses item when already expanded', () => {
      expandedItemSignal.value = 'language'
      toggleExpandedItem('language')
      expect(expandedItemSignal.value).toBeNull()
    })

    it('switches to different item when another is expanded', () => {
      expandedItemSignal.value = 'language'
      toggleExpandedItem('country')
      expect(expandedItemSignal.value).toBe('country')
    })
  })

  describe('resetMobileMenuState', () => {
    it('resets all state', () => {
      mobileMenuOpenSignal.value = true
      expandedItemSignal.value = 'language'
      resetMobileMenuState()
      expect(mobileMenuOpenSignal.value).toBe(false)
      expect(expandedItemSignal.value).toBeNull()
    })
  })
})
