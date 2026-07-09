import { render, screen, act } from '@testing-library/react'
import { RegionProvider } from './RegionProvider'
import { regionSignal, setRegion } from '../signals/region-signal'
import { DEFAULT_REGION, REGION_STORAGE_KEY } from '../config/regions'

describe('RegionProvider', () => {
  beforeEach(() => {
    regionSignal.value = DEFAULT_REGION
    localStorage.clear()
  })

  describe('Given initialRegion prop is provided', () => {
    it('Then region is set to initialRegion', () => {
      render(
        <RegionProvider initialRegion='ES'>
          <div>Test</div>
        </RegionProvider>
      )

      expect(regionSignal.value).toBe('ES')
    })
  })

  describe('Given localStorage has persisted region', () => {
    it('Then region is loaded from localStorage', () => {
      localStorage.setItem(REGION_STORAGE_KEY, 'GB')

      render(
        <RegionProvider>
          <div>Test</div>
        </RegionProvider>
      )

      expect(regionSignal.value).toBe('GB')
    })
  })

  describe('Given no persisted region and no initial prop', () => {
    it('Then region is set to DEFAULT_REGION', () => {
      render(
        <RegionProvider>
          <div>Test</div>
        </RegionProvider>
      )

      expect(regionSignal.value).toBe(DEFAULT_REGION)
    })
  })

  describe('Given region signal changes', () => {
    it('Then region is persisted to localStorage', () => {
      render(
        <RegionProvider>
          <div>Test</div>
        </RegionProvider>
      )

      act(() => {
        setRegion('MX')
      })

      expect(localStorage.getItem(REGION_STORAGE_KEY)).toBe('MX')
    })
  })

  describe('Given children are rendered', () => {
    it('Then children are displayed', () => {
      render(
        <RegionProvider>
          <div data-testid='child'>Test Child</div>
        </RegionProvider>
      )

      expect(screen.getByTestId('child')).toHaveTextContent('Test Child')
    })
  })
})
