import { test as base } from '@playwright/test'

// Mock BanRep SUAMECA JSON responses (array with single entry per currency)
const BANREP_MOCKS: Record<string, string> = {
  '1': JSON.stringify([{ unidad: 'COP/USD', valor: 3284.6715, fecha: '10/07/2026' }]),
  '30': JSON.stringify([{ unidad: 'COP/EUR', valor: 3750.0, fecha: '10/07/2026' }]),
  '31': JSON.stringify([{ unidad: 'COP/GBP', valor: 4411.7647, fecha: '10/07/2026' }]),
  '28': JSON.stringify([{ unidad: 'COP/CNY', valor: 452.0, fecha: '10/07/2026' }]),
  '33': JSON.stringify([{ unidad: 'COP/JPY', valor: 22.0, fecha: '10/07/2026' }]),
}

// Mock Banxico response for MXN (USDMXN cross rate: 17.48 MXN per USD)
// Must include idSerie: SF43718 to pass extractSeries validation
const MOCK_BANXICO_RESPONSE = JSON.stringify({
  bmx: { series: [{ idSerie: 'SF43718', datos: [{ dato: '17.4800', fecha: '10/07/2026' }] }] },
})

/**
 * Extended test fixture with geo detection blocked and mock rates provided.
 */
export const test = base.extend<{ blockGeoDetection: void }>({
  blockGeoDetection: [
    async ({ page, context }, use) => {
      // Deny geolocation permission
      await context.clearPermissions()

      // Block all geo API endpoints with immediate failure
      await page.route('https://api.country.is/**', route => route.abort('blockedbyclient'))
      await page.route('https://get.geojs.io/**', route => route.abort('blockedbyclient'))
      await page.route('https://api.bigdatacloud.net/**', route => route.abort('blockedbyclient'))

      // Mock BanRep rate endpoints with deterministic data
      await page.route('https://suameca.banrep.gov.co/**', route => {
        const url = new URL(route.request().url())
        const seriesId = url.searchParams.get('idSerie') || '1'
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: BANREP_MOCKS[seriesId] || BANREP_MOCKS['1'],
        })
      })
      await page.route('https://www.banxico.org.mx/**', route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: MOCK_BANXICO_RESPONSE,
        })
      )

      await use()
    },
    { auto: true }, // Automatically apply to all tests
  ],
})

export { expect } from '@playwright/test'
