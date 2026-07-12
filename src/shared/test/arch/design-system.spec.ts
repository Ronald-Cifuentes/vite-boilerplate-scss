/**
 * Design System Architecture Rules
 * Validates design system boundaries via import checks per ADR-0005
 */

// Import design system exports to verify they exist
import { Button } from '../../components/Button'
import { IconButton } from '../../components/IconButton'
import { Link } from '../../components/Link'
import { Announcer } from '../../components/Announcer'

import {
  ThemeProvider,
  useTheme,
  isValidTheme,
  isValidPreference,
  THEME_STORAGE_KEY,
  SUPPORTED_PREFERENCES,
} from '../../../theme'

import {
  RegionProvider,
  useRegion,
  isValidRegion,
  REGION_STORAGE_KEY,
  SUPPORTED_REGIONS,
  REGION_METADATA,
} from '../../../region'

import {
  I18nProvider,
  useTranslation,
  isSupportedLocale,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  LOCALE_METADATA,
} from '../../../i18n'

describe('Design System Architecture Rules', () => {
  describe('Shared Components Export Correctly', () => {
    it('Button component is exported', () => {
      expect(Button).toBeDefined()
    })

    it('IconButton component is exported', () => {
      expect(IconButton).toBeDefined()
    })

    it('Link component is exported', () => {
      expect(Link).toBeDefined()
    })

    it('Announcer component is exported', () => {
      expect(Announcer).toBeDefined()
    })
  })

  describe('Design Token Consistency', () => {
    it('Theme storage key follows convention', () => {
      // This verifies config alignment - storage key must match index.html FOUC script
      expect(THEME_STORAGE_KEY).toBe('app-theme')
    })

    it('Region storage key follows convention', () => {
      expect(REGION_STORAGE_KEY).toBe('app-region')
    })

    it('Locale storage key follows convention', () => {
      expect(LOCALE_STORAGE_KEY).toBe('app-locale')
    })
  })

  describe('Hexagonal Architecture Compliance', () => {
    it('Theme domain exports ThemeProvider adapter', () => {
      expect(ThemeProvider).toBeDefined()
      expect(typeof ThemeProvider).toBe('function')
    })

    it('Theme domain exports useTheme hook', () => {
      expect(useTheme).toBeDefined()
      expect(typeof useTheme).toBe('function')
    })

    it('Region domain exports RegionProvider adapter', () => {
      expect(RegionProvider).toBeDefined()
      expect(typeof RegionProvider).toBe('function')
    })

    it('Region domain exports useRegion hook', () => {
      expect(useRegion).toBeDefined()
      expect(typeof useRegion).toBe('function')
    })

    it('i18n domain exports I18nProvider adapter', () => {
      expect(I18nProvider).toBeDefined()
      expect(typeof I18nProvider).toBe('function')
    })

    it('i18n domain exports useTranslation hook', () => {
      expect(useTranslation).toBeDefined()
      expect(typeof useTranslation).toBe('function')
    })
  })

  describe('Type Guards Work Correctly', () => {
    it('isValidTheme accepts valid effective themes', () => {
      expect(isValidTheme('light')).toBe(true)
      expect(isValidTheme('dark')).toBe(true)
    })

    it('isValidTheme rejects invalid themes', () => {
      expect(isValidTheme('auto')).toBe(false)
      expect(isValidTheme('')).toBe(false)
    })

    it('isValidTheme rejects system (not valid as effective theme)', () => {
      expect(isValidTheme('system')).toBe(false)
    })

    it('isValidPreference accepts valid preferences', () => {
      expect(isValidPreference('light')).toBe(true)
      expect(isValidPreference('dark')).toBe(true)
      expect(isValidPreference('system')).toBe(true)
    })

    it('isValidPreference rejects invalid preferences', () => {
      expect(isValidPreference('auto')).toBe(false)
      expect(isValidPreference('')).toBe(false)
    })

    it('isValidRegion accepts valid regions', () => {
      expect(isValidRegion('US')).toBe(true)
      expect(isValidRegion('ES')).toBe(true)
      expect(isValidRegion('GB')).toBe(true)
      expect(isValidRegion('MX')).toBe(true)
      expect(isValidRegion('CO')).toBe(true)
    })

    it('isValidRegion rejects invalid regions', () => {
      expect(isValidRegion('FR')).toBe(false)
      expect(isValidRegion('')).toBe(false)
    })

    it('isSupportedLocale accepts valid locales', () => {
      expect(isSupportedLocale('en')).toBe(true)
      expect(isSupportedLocale('es')).toBe(true)
    })

    it('isSupportedLocale rejects invalid locales', () => {
      expect(isSupportedLocale('fr')).toBe(false)
      expect(isSupportedLocale('')).toBe(false)
    })
  })

  describe('Configuration Constants', () => {
    it('SUPPORTED_PREFERENCES includes light, dark, and system', () => {
      expect(SUPPORTED_PREFERENCES).toContain('light')
      expect(SUPPORTED_PREFERENCES).toContain('dark')
      expect(SUPPORTED_PREFERENCES).toContain('system')
      expect(SUPPORTED_PREFERENCES).toHaveLength(3)
    })

    it('SUPPORTED_REGIONS includes all 7 regions', () => {
      expect(SUPPORTED_REGIONS).toContain('US')
      expect(SUPPORTED_REGIONS).toContain('ES')
      expect(SUPPORTED_REGIONS).toContain('GB')
      expect(SUPPORTED_REGIONS).toContain('MX')
      expect(SUPPORTED_REGIONS).toContain('CO')
      expect(SUPPORTED_REGIONS).toContain('CN')
      expect(SUPPORTED_REGIONS).toContain('JP')
      expect(SUPPORTED_REGIONS).toHaveLength(7)
    })

    it('SUPPORTED_LOCALES includes all 4 locales', () => {
      expect(SUPPORTED_LOCALES).toContain('en')
      expect(SUPPORTED_LOCALES).toContain('es')
      expect(SUPPORTED_LOCALES).toContain('zh')
      expect(SUPPORTED_LOCALES).toContain('ja')
      expect(SUPPORTED_LOCALES).toHaveLength(4)
    })
  })

  describe('Region Metadata', () => {
    it('Each region has required metadata fields', () => {
      for (const region of SUPPORTED_REGIONS) {
        const meta = REGION_METADATA[region]
        expect(meta.code).toBe(region)
        expect(meta.nativeName).toBeTruthy()
        expect(meta.englishName).toBeTruthy()
        expect(meta.dateLocale).toBeTruthy()
        expect(meta.numberLocale).toBeTruthy()
        expect(meta.currency).toBeTruthy()
      }
    })
  })

  describe('Locale Metadata', () => {
    it('Each locale has required metadata fields', () => {
      for (const locale of SUPPORTED_LOCALES) {
        const meta = LOCALE_METADATA[locale]
        expect(meta.code).toBe(locale)
        expect(meta.nativeName).toBeTruthy()
        expect(meta.englishName).toBeTruthy()
        expect(meta.direction).toMatch(/^(ltr|rtl)$/)
      }
    })
  })
})
