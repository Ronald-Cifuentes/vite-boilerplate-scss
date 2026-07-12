# ADR-0010: Currency Conversion with BanRep Rates and Viewport-Safe Dropdown Positioning

- **Status:** Accepted
- **Date:** 2026-07-10
- **Amended:** 2026-07-10 (OQ-1 MXN via Banxico approved; OQ-2 budget rev.4 approved)
- **Deciders:** Architect Agent + Project Owner (amendment decisions)
- **Task:** 4 (Iteration 1, amended)
- **Supersedes:** None (new capability)
- **Refines:** ADR-0007 Section "Mobile Behavior > Positioning" (implements the specified flip
  logic)

---

## Context

### User Requirements (Verbatim, Non-Negotiable)

1. "Ensure the responsive design is 100% complete."
2. "Fix the dropdown pop-ups; they must always remain within the page, both on web and mobile."
3. "Add COP to the currency selector."
4. "When the currency selector is changed, the values must be recalculated. This cannot be a
   cosmetic change or just a visual change of the symbol; the prices must be converted. For example,
   if I have $4,500 COP = $1.37 USD = $1.20 EUR = $23.94 MXN = $1.02 GBP."
5. "Use ',' for tens of thousands and '.' for decimals."
6. "You must resolve this using information from the Central Bank of Colombia (Banco de la
   Republica), as was done in this project. Check it at
   /Users/x/Downloads/code/own/fullstack/magic-sky"

### Reference Implementation Analysis

The magic-sky backend FX implementation was analyzed. Key patterns extracted and **defects
identified as anti-patterns** (from `QA/_evidence/audit-fx.md`):

| ID  | Defect                                    | Severity | This ADR's Mitigation                                            |
| --- | ----------------------------------------- | -------- | ---------------------------------------------------------------- |
| C1  | Off-by-100 decimal scaling                | Critical | Display-only conversion in MAJOR units; no minor-unit path       |
| H2  | Unbounded stale-rate fallback             | High     | Explicit 24-hour staleness bound; UI state shows stale age       |
| H3  | Silent rate INVERSION on missing `unidad` | High     | Fail-closed: reject data point if orientation cannot be asserted |
| M2  | Comma-decimal parse asymmetry             | Medium   | Defensive normalization (both SUAMECA and Banxico)               |
| L2  | Float precision loss                      | Low      | Acceptable: conversion is DISPLAY-ONLY (no money path)           |

### Current State

- **Currency domain exists:** `src/currency/` with USD/EUR/GBP/MXN, `formatCurrency` via
  `Intl.NumberFormat`, region-currency linking.
- **Greeting.tsx:17** hardcodes `formatCurrency(1234.56)` - must change to base price 4500 COP.
- **Dropdown positioning (CSS):** Static `position: absolute; top: 100%; left: 0;` with NO
  viewport-aware flip logic. User bug report confirms dropdowns overflow viewport on mobile.

---

## Empirical Verification (Appendix A: Full Curl Evidence)

### SUAMECA API Availability (BanRep - Colombia)

**Endpoint:**
`https://suameca.banrep.gov.co/estadisticas-economicas-back/rest/estadisticaEconomicaRestService/consultaInformacionSerie`

**CORS Header Verified:**

```
Access-Control-Allow-Origin: *
```

Result: **CORS-OPEN for direct frontend fetch**.

### Series Verification (BanRep)

| Currency | Series ID | Verified `unidad` | Verified `valor` (2026-07-10) | Status    |
| -------- | --------- | ----------------- | ----------------------------- | --------- |
| USD      | 1         | `COP/USD`         | 3305.38                       | CONFIRMED |
| EUR      | 30        | `COP/EUR`         | 3818.05486                    | CONFIRMED |
| GBP      | 31        | `COP/GBP`         | 4472.29229                    | CONFIRMED |
| MXN      | -         | -                 | -                             | NOT FOUND |

**MXN Finding:** Series IDs 1-200 scanned. No COP/MXN or MXN/COP series exists in SUAMECA. BanRep
does not publish Mexican Peso rates as part of their reserve currency publications.

### Banxico SIE API Availability (Mexico - for MXN cross-rate)

**Endpoint (case-sensitive):**
`https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/oportuno`

**WARNING:** Path is `/SieAPIRest/`, NOT `/SIEAPIRest/`. Wrong casing 302-redirects to
`anterior.banxico.org.mx` and returns 404.

**CORS Headers Verified:**

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
Access-Control-Allow-Headers: Bmx-Token, Accept, Accept-Encoding, Content-Type
```

Result: **CORS-OPEN for direct frontend fetch**. Token can be passed as query param (`?token=...`)
to keep request as simple GET with no CORS preflight.

### datos.gov.co Socrata Fallback

**Endpoint:** `https://www.datos.gov.co/resource/32sa-8pi3.json` **CORS:**
`Access-Control-Allow-Origin: *` **Coverage:** USD/COP only (TRM mirror)

---

## Decision

### 1. Exchange Rates Architecture

**Location:** New domain `src/exchange-rates/` (sibling to `src/currency/`)

**Rationale:** Separation of concerns - `currency` owns display format and user selection;
`exchange-rates` owns rate fetching, caching, and conversion math.

```
src/exchange-rates/
  ports/
    ExchangeRates.ts          # Port interface
  adapters/
    BanrepRatesAdapter.ts     # BanRep SUAMECA adapter (USD/EUR/GBP)
    BanxicoRatesAdapter.ts    # Banxico SIE adapter (MXN via USD cross-rate)
  signals/
    rates-signal.ts           # Rates state + fetch lifecycle
  config/
    series.ts                 # Series ID mapping, staleness config
    prices.ts                 # Base price (4500 COP)
  types/
    Rate.ts                   # Rate data shape
  hooks/
    useExchangeRates.ts       # Consumer hook
  index.ts                    # Barrel export
```

### 2. Rate Port Interface

**File:** `src/exchange-rates/ports/ExchangeRates.ts`

```typescript
export type RateStatus = 'loading' | 'live' | 'stale' | 'unavailable' | 'partial'

export interface RateSnapshot {
  copPerUnit: number // COP per 1 foreign unit (e.g., 3305.38 for USD)
  sourceDate: Date // Date the rate was published
  retrievedAt: Date // When we fetched it
}

export interface RatesState {
  status: RateStatus
  rates: Partial<Record<SupportedCurrency, RateSnapshot>>
  staleAgeMs?: number // If status === 'stale', how old
  unavailableCurrencies?: SupportedCurrency[] // If status === 'partial', which failed
  error?: string // If status === 'unavailable', why
}

export interface ExchangeRatesPort {
  state: RatesState
  refresh: () => Promise<void>
  convert: (amountCop: number, toCurrency: SupportedCurrency) => number | null
  getLastRefresh: () => Date | null
}
```

**Note (Amendment):** Added `'partial'` status and `unavailableCurrencies` field to support MXN
being unavailable while other currencies remain functional.

### 3. BanRep Adapter Design (USD/EUR/GBP)

**Request:**

```
GET https://suameca.banrep.gov.co/.../consultaInformacionSerie?idSerie={id}
```

**Series Mapping:**

```typescript
export const BANREP_SERIES: Record<'USD' | 'EUR' | 'GBP', number> = {
  USD: 1, // TRM (Tasa Representativa del Mercado)
  EUR: 30, // COP/EUR reserve rate
  GBP: 31, // COP/GBP reserve rate
}
```

**Parse + Validate (fail-closed per H3 anti-pattern):**

1. JSON parse - fail if invalid
2. Extract `unidad` field - MUST match `COP/{CURRENCY}` pattern exactly
3. If `unidad` missing or malformed: **REJECT** (do not invert, do not guess)
4. Extract `valor` or latest `data[]` point
5. Numeric guards: `Number.isFinite(rate) && rate > 0` - fail if not
6. Return `RateSnapshot` with `copPerUnit = rate`

**HTTP Hygiene:**

- `AbortController` timeout: 8000ms
- Non-2xx response: return null (trigger stale/unavailable path)
- Fetch error: return null
- Comma-decimal normalization: defensive (replace `,` with `.` before `Number()`)

### 4. Banxico Adapter Design (MXN via USD Cross-Rate) [AMENDMENT - OQ-1 RESOLVED]

**Owner Decision (2026-07-10):** Approved option C - MXN via Banco de Mexico.

**Source:** Banxico SIE API, series SF43718 (Tipo de cambio FIX)

**Request:**

```
GET https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/oportuno?token={VITE_BANXICO_TOKEN}
```

**CRITICAL - Case Sensitivity:** Path MUST be `/SieAPIRest/` (capital S-i-e, capital A-P-I, capital
R-est). The path `/SIEAPIRest/` (all caps SIE) 302-redirects to `anterior.banxico.org.mx` and 404s.

**Token Policy:**

- Environment variable: `VITE_BANXICO_TOKEN`
- **NEVER committed** to git (`.env` is gitignored)
- Add to `.env.example`: `VITE_BANXICO_TOKEN=your_banxico_token_here`
- Absent/invalid/expired token OR fetch failure: MXN enters `'unavailable'` state for that currency
  only; other currencies remain functional (partial availability)

**Security Note (SEC-006):** Token exposure in the built bundle is an **OWNER-ACCEPTED risk**
(decision 2026-07-10). The token is read-only for free public data. To be recorded by Security
Auditor as SEC-006 accepted.

**Response Shape (to-be-verified-by-FE-with-fixtures):**

The Banxico SIE API documentation page (`/SieAPIRest/service/v1/doc/`) is currently unreachable
(returns "The resource you are looking for has been removed..."). The expected response structure
based on API conventions and error responses is:

```json
{
  "bmx": {
    "series": [
      {
        "idSerie": "SF43718",
        "titulo": "Tipo de cambio FIX",
        "datos": [
          {
            "fecha": "10/07/2026",
            "dato": "17.5000"
          }
        ]
      }
    ]
  }
}
```

**Parser Contract (defensive):**

```typescript
function parseBanxicoResponse(body: string): number | null {
  let json: unknown
  try {
    json = JSON.parse(body)
  } catch {
    return null
  }

  // Navigate: bmx.series[0].datos[0].dato
  const series = (json as any)?.bmx?.series?.[0]
  if (!series) return null

  const datos = series.datos?.[0]
  if (!datos) return null

  const datoStr = datos.dato
  // Handle 'N/E' (No disponible / holidays) explicitly
  if (typeof datoStr !== 'string' || datoStr === 'N/E') return null

  // Comma-decimal normalization (M2 anti-pattern mitigation)
  const normalized = datoStr.replace(',', '.')
  const rate = Number(normalized)

  // Numeric guards
  if (!Number.isFinite(rate) || rate <= 0) return null

  return rate // MXN per 1 USD
}
```

**Cross-Rate Composition:**

```
COP/MXN = (COP/USD from BanRep TRM) / (MXN/USD from Banxico FIX)
```

**Sanity Check (user's illustrative example):**

- TRM: 3305.38 COP/USD
- FIX: ~17.5 MXN/USD
- COP/MXN = 3305.38 / 17.5 = 188.88 COP per MXN
- 4500 COP / 188.88 = **23.82 MXN** (consistent with user's ~23.94)

**Orientation Assertions (fail-closed per H3):**

| Source  | Field to Assert     | Expected Pattern | Action if Mismatch |
| ------- | ------------------- | ---------------- | ------------------ |
| BanRep  | `unidad`            | `COP/USD`        | REJECT rate        |
| Banxico | `series[0].idSerie` | `SF43718`        | REJECT rate        |
| Banxico | `series[0].titulo`  | Contains "FIX"   | Log warning only   |

### 5. Rates Signal + Fetch Lifecycle

**File:** `src/exchange-rates/signals/rates-signal.ts`

```typescript
import { signal, computed } from '@preact/signals-react'

export const ratesSignal = signal<RatesState>({
  status: 'loading',
  rates: {},
})

export const lastRefreshSignal = signal<Date | null>(null)

// Fetch on app load (effect in provider)
// Retry policy: 3 attempts with exponential backoff (1s, 2s, 4s)
// AbortController timeout: 8000ms per request
// Partial success: if BanRep succeeds but Banxico fails, status = 'partial'
```

### 6. LocalStorage Cache with Bounded Staleness

**Storage Key:** `app-exchange-rates`

**Stored Shape:**

```typescript
interface CachedRates {
  rates: Record<string, { copPerUnit: number; sourceDate: string; retrievedAt: string }>
  cachedAt: string // ISO timestamp
}
```

**Staleness Bound:** 24 hours

**Rationale:** Display-only softens the urgency, but unbounded staleness is prohibited per H2
anti-pattern. BanRep publishes TRM daily (business days), so 24h covers weekends while ensuring
weekday rates are reasonably fresh. UI will show stale age when > 1 hour.

**Behavior:**

- On app load: Read cache, set `status: 'stale'` with age if cache exists
- Immediately attempt live fetch
- If live succeeds: Update cache, set `status: 'live'`
- If live fails AND cache exists AND cache < 24h: Keep `status: 'stale'`, show age
- If live fails AND (no cache OR cache > 24h): Set `status: 'unavailable'`
- If some sources succeed and others fail: Set `status: 'partial'`, list failed currencies

### 7. UI States (All i18n'd)

| Status        | Display                                                | i18n Keys                  |
| ------------- | ------------------------------------------------------ | -------------------------- |
| `loading`     | Spinner or skeleton in price area                      | `rates.loading`            |
| `live`        | Normal price display, no indicator                     | -                          |
| `stale`       | Price with age indicator: "Rates from 2h ago"          | `rates.stale`, `rates.ago` |
| `partial`     | Available currencies show; unavailable show "N/A"      | `rates.partial`            |
| `unavailable` | "Rates unavailable" message, price area shows COP only | `rates.unavailable`        |

### 8. Conversion Math

**Formula (major units, per C1 anti-pattern mitigation):**

```typescript
function convertCopTo(amountCop: number, toCurrency: SupportedCurrency): number | null {
  if (toCurrency === 'COP') return amountCop // Identity

  const rate = ratesSignal.value.rates[toCurrency]
  if (!rate) return null

  // rate.copPerUnit = COP per 1 foreign unit
  // To get foreign amount: COP / (COP/foreign) = foreign
  const foreignAmount = amountCop / rate.copPerUnit

  // Round to display digits (half-up)
  const decimals = CURRENCY_DECIMALS[toCurrency]
  return Math.round(foreignAmount * 10 ** decimals) / 10 ** decimals
}
```

**Decimal Places:**

| Currency | Decimals | Example Output |
| -------- | -------- | -------------- |
| COP      | 0        | 4,500          |
| USD      | 2        | 1.37           |
| EUR      | 2        | 1.20           |
| GBP      | 2        | 1.02           |
| MXN      | 2        | 23.94          |

### 9. Display Format Contract

**User Example (verbatim):**

> "$4,500 COP = $1.37 USD = $1.20 EUR = $23.94 MXN = $1.02 GBP"

**Derived Format:** `{symbol}{amount} {ISO}`

| Currency | Symbol | ISO | Example      |
| -------- | ------ | --- | ------------ |
| COP      | $      | COP | $4,500 COP   |
| USD      | $      | USD | $1.37 USD    |
| EUR      | EUR    | EUR | EUR1.20 EUR  |
| GBP      | GBP    | GBP | GBP1.02 GBP  |
| MXN      | MX$    | MXN | MX$23.94 MXN |

**Separator Override:**

- Thousands: `,` (comma)
- Decimals: `.` (period)
- **Intentionally overrides locale-based formatting** for AMOUNTS only
- Rationale: User requirement explicit ("Use ',' for tens of thousands and '.' for decimals")
- Dates and other formatting remain locale-aware

**Implementation:**

```typescript
function formatAmount(value: number, currency: SupportedCurrency): string {
  const decimals = CURRENCY_DECIMALS[currency]
  const fixed = value.toFixed(decimals)
  // Add thousands separator (comma)
  const [int, dec] = fixed.split('.')
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const formatted = dec ? `${withCommas}.${dec}` : withCommas
  return `${CURRENCY_SYMBOLS[currency]}${formatted} ${currency}`
}
```

### 10. Base Price Configuration

**Location:** `src/exchange-rates/config/prices.ts`

```typescript
export const BASE_PRICE_COP = 4500 as const
```

**Greeting Update:**

```typescript
import { BASE_PRICE_COP } from '../../../../exchange-rates/config/prices'
import { useExchangeRates } from '../../../../exchange-rates'

const { convert } = useExchangeRates()
const { currency } = useCurrency()

const convertedPrice = convert(BASE_PRICE_COP, currency)
const formattedPrice =
  convertedPrice !== null
    ? formatAmount(convertedPrice, currency)
    : formatAmount(BASE_PRICE_COP, 'COP') // Fallback to COP if conversion unavailable
```

### 11. COP in Currency Selector

**Addition to `SUPPORTED_CURRENCIES`:**

```typescript
export const SUPPORTED_CURRENCIES: readonly SupportedCurrency[] = [
  'COP', // Colombian Peso (base currency)
  'USD',
  'EUR',
  'GBP',
  'MXN',
] as const
```

**COP Metadata:**

```typescript
COP: {
  code: 'COP',
  symbol: '$',
  name: 'Colombian Peso',
  localizedNameKey: 'currency.cop',
  decimals: 0,
}
```

**Icon:** `MdAttachMoney` (same as USD/MXN - currency icons use this; differentiation via label)

**i18n Keys (en/es):**

```typescript
// en.ts
currency: {
  cop: 'Colombian Peso',
  // ...existing
}

// es.ts
currency: {
  cop: 'Peso Colombiano',
  // ...existing
}
```

**Identity Conversion:** When `currency === 'COP'`, `convert(amountCop, 'COP')` returns `amountCop`
unchanged.

### 12. Dropdown Positioning Contract (Implements ADR-0007 Gap)

**Current State (broken):**

```scss
&__panel {
  position: absolute;
  top: 100%;
  left: 0;
  // NO viewport awareness
}
```

**Required Behavior (ADR-0007 Section "Mobile Behavior > Positioning"):**

- Prefer below trigger; flip above if insufficient viewport space
- Left-align by default; flip to right-align if overflowing viewport right edge

**Implementation Approach: Measurement-Based (No Dependencies)**

**Why no floating-ui/popper:** Bundle headroom is critical. No new runtime dependencies.

**Positioning Logic (in `Dropdown.tsx`):**

```typescript
const [position, setPosition] = useState<{
  flipVertical: boolean // true = open above trigger
  flipHorizontal: boolean // true = right-align panel
}>({ flipVertical: false, flipHorizontal: false })

useEffect(() => {
  if (!isOpen) return

  const trigger = triggerRef.current
  const panel = panelRef.current
  if (!trigger || !panel) return

  const triggerRect = trigger.getBoundingClientRect()
  const panelRect = panel.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth
  const GUTTER = 8

  // Vertical flip: open above if not enough space below AND more space above
  const spaceBelow = viewportHeight - triggerRect.bottom - GUTTER
  const spaceAbove = triggerRect.top - GUTTER
  const flipVertical = spaceBelow < panelRect.height && spaceAbove > spaceBelow

  // Horizontal flip: right-align if right edge would overflow viewport
  const panelWidth = panelRect.width
  const rightEdge = triggerRect.left + panelWidth
  const flipHorizontal = rightEdge > viewportWidth - GUTTER

  setPosition({ flipVertical, flipHorizontal })
}, [isOpen])
```

**CSS Application:**

```scss
&__panel {
  position: absolute;
  z-index: z.$z-dropdown;

  // Default: below trigger, left-aligned
  top: 100%;
  left: 0;
  margin-top: t.$space-1;

  &--flip-vertical {
    top: auto;
    bottom: 100%;
    margin-top: 0;
    margin-bottom: t.$space-1;
  }

  &--flip-horizontal {
    left: auto;
    right: 0;
  }
}
```

**Measurement Timing:**

- On open (isOpen becomes true)
- On window resize (debounced 100ms, only when open)
- **NOT on scroll** (minimal viable; scroll is rare during dropdown interaction)

**SSR Safety:** Position calculation in useEffect (client-only).

**Reduced Motion:** Unaffected (flip is instant positioning, not animation).

**Hard Clamp:** Panel CSS includes `max-width: calc(100vw - 16px)` to ensure always within viewport.

### 13. E2E Strategy

**Deterministic Mocking via `page.route`:**

**Exact Example Fixture (user's numbers):**

To produce exactly `$4,500 COP = $1.37 USD = $1.20 EUR = $23.94 MXN = $1.02 GBP`:

```typescript
const MOCK_RATES_EXACT_EXAMPLE = {
  // BanRep responses
  banrep: {
    USD: { idSerie: 1, unidad: 'COP/USD', valor: 3284.6715 }, // 4500 / 1.37 = 3284.6715
    EUR: { idSerie: 30, unidad: 'COP/EUR', valor: 3750.0 }, // 4500 / 1.20 = 3750.00
    GBP: { idSerie: 31, unidad: 'COP/GBP', valor: 4411.7647 }, // 4500 / 1.02 = 4411.7647
  },
  // Banxico response
  banxico: {
    mxnPerUsd: 17.2956, // (3284.6715 / 17.2956) = 190.0 COP/MXN; but need 187.97
    // Recalc: 4500 / 23.94 = 187.9699 COP/MXN
    // COP/MXN = COP/USD / MXN/USD => MXN/USD = COP/USD / COP/MXN = 3284.6715 / 187.9699 = 17.4749
  },
}

// Final verified fixture:
const MOCK_RATES_EXACT = {
  banrep_usd: { valor: 3284.6715, unidad: 'COP/USD' }, // => $1.37 USD
  banrep_eur: { valor: 3750.0, unidad: 'COP/EUR' }, // => EUR1.20 EUR
  banrep_gbp: { valor: 4411.7647, unidad: 'COP/GBP' }, // => GBP1.02 GBP
  banxico_fix: { dato: '17.4749' }, // => MX$23.94 MXN
}
```

**Test Cases:**

```typescript
test('currency conversion matches exact user example', async ({ page }) => {
  await page.route('**/suameca.banrep.gov.co/**', route => {
    const url = new URL(route.request().url())
    const idSerie = url.searchParams.get('idSerie')
    // Return appropriate mock based on idSerie
  })
  await page.route('**/banxico.org.mx/SieAPIRest/**', route => {
    route.fulfill({
      body: JSON.stringify({
        bmx: { series: [{ idSerie: 'SF43718', datos: [{ dato: '17.4749' }] }] },
      }),
    })
  })
  // Navigate, select each currency, verify exact displayed amount
  // $4,500 COP, $1.37 USD, EUR1.20 EUR, MX$23.94 MXN, GBP1.02 GBP
})

test('MXN unavailable when Banxico token missing', async ({ page }) => {
  // Mock VITE_BANXICO_TOKEN as absent
  await page.route('**/banxico.org.mx/**', route => route.abort())
  // Verify USD/EUR/GBP work, MXN shows "N/A" or unavailable state
})

test('partial availability state', async ({ page }) => {
  await page.route('**/suameca.banrep.gov.co/**', route => route.fulfill({ body: '...' }))
  await page.route('**/banxico.org.mx/**', route => route.abort())
  // Verify status is 'partial' and MXN listed in unavailableCurrencies
})
```

**Failure Path:**

```typescript
test('shows unavailable state when all rates fetch fails', async ({ page }) => {
  await page.route('**/suameca.banrep.gov.co/**', route => route.abort())
  await page.route('**/banxico.org.mx/**', route => route.abort())
  // Assert rates.unavailable UI state
})
```

**Stale Path:**

```typescript
test('shows stale indicator when using cached rates', async ({ page }) => {
  // Set up localStorage with old cached rates
  // Mock fetch to fail
  // Assert stale UI state with age
})
```

**Positioning Tests:**

```typescript
test('dropdown panel stays within viewport on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  // Open dropdown near right edge
  const panel = page.locator('[data-testid="currency-dropdown-panel"]')
  const box = await panel.boundingBox()
  expect(box.x).toBeGreaterThanOrEqual(8)
  expect(box.x + box.width).toBeLessThanOrEqual(375 - 8)
})

test('dropdown flips above when near bottom', async ({ page }) => {
  // Scroll to put trigger near bottom
  // Open dropdown
  // Assert panel is above trigger
})
```

**Live Smoke (optional, non-blocking):**

```typescript
test.describe('@live', () => {
  test('can fetch real rates from SUAMECA', async ({ page }) => {
    // No mocking
    // Just verify fetch doesn't error and some rate is displayed
  })
})
```

### 14. Environment Configuration

**.env.example (add row):**

```
# Banxico SIE API token for MXN exchange rate
# Get your token at: https://www.banxico.org.mx/SieAPIRest/service/v1/token
# This is a READ-ONLY token for public data. Bundle exposure is accepted (SEC-006).
VITE_BANXICO_TOKEN=your_banxico_token_here
```

---

## Consequences

### Positive

- **Meets user requirement** for real currency conversion using official central bank rates
- **Full currency support** including MXN via Banxico cross-rate (OQ-1 resolved)
- **Fail-closed design** avoids silent rate inversion (H3 anti-pattern) on both sources
- **Bounded staleness** prevents arbitrarily old rates (H2 anti-pattern)
- **Display-only conversion** avoids decimal precision bugs (C1/L2 acceptable)
- **Viewport-safe dropdowns** fix the reported mobile overflow issue
- **No new runtime dependencies** (fetch is native; positioning hand-rolled)
- **Partial availability** - one source failing doesn't break all conversions

### Negative

- **Banxico token in bundle** - accepted risk (SEC-006) for read-only public data
- **Bundle size increase** - rev.4 budget approved (228 KB raw / 72 KB gzip)
- **Network dependency** for rates (mitigated by cache + graceful degradation)
- **Two external dependencies** - BanRep and Banxico (mitigated by independent failure handling)

### Neutral

- Positioning logic is ~80 lines of code - maintainable without floating-ui
- Cache in localStorage - consistent with existing theme/locale/currency persistence
- UI states require i18n additions (8 new keys for 2 locales = 16 strings)

---

## Resolved Questions (Amendment 2026-07-10)

### OQ-1: MXN Currency Support [RESOLVED]

**Decision:** Owner approved option C - MXN via Banco de Mexico.

**Implementation:** Banxico SIE API series SF43718 (Tipo de cambio FIX). Cross-rate composition
COP/MXN = (COP/USD) / (MXN/USD). Token via `VITE_BANXICO_TOKEN` env var. Fail-closed on token
absence (MXN unavailable, other currencies unaffected).

**Security:** Token exposure accepted as SEC-006 (read-only public data).

### OQ-2: Bundle Size Budget [RESOLVED]

**Decision:** Owner approved rev.4 budget.

**Implementation:** See `docs/performance/budgets.md` rev.4:

- Raw: 228,000 B (warning 224,000 B)
- Gzip: 72,000 B (warning 70,000 B)

---

## Appendix A: Curl Evidence

### A.1 SUAMECA TRM (USD/COP) - Series 1

```bash
$ curl -s "https://suameca.banrep.gov.co/estadisticas-economicas-back/rest/estadisticaEconomicaRestService/consultaInformacionSerie?idSerie=1" | jq '.[0] | {id, nombre, unidad, valor, fecha}'

{
  "id": 1,
  "nombre": "Tasa Representativa del Mercado (TRM)",
  "unidad": "COP/USD",
  "valor": 3305.38,
  "fecha": "10/07/2026"
}
```

### A.2 SUAMECA EUR/COP - Series 30

```bash
$ curl -s "...?idSerie=30" | jq '.[0] | {id, nombre, unidad, valor, fecha}'

{
  "id": 30,
  "nombre": "Euro - COP/EUR - Tasa media",
  "unidad": "COP/EUR",
  "valor": 3818.05486,
  "fecha": "09/07/2026"
}
```

### A.3 SUAMECA GBP/COP - Series 31

```bash
$ curl -s "...?idSerie=31" | jq '.[0] | {id, nombre, unidad, valor, fecha}'

{
  "id": 31,
  "nombre": "Libra esterlina - COP/GBP - Tasa media",
  "unidad": "COP/GBP",
  "valor": 4472.29229,
  "fecha": "09/07/2026"
}
```

### A.4 SUAMECA CORS Header Verification

```bash
$ curl -sI -H 'Origin: http://localhost:5173' "...?idSerie=1" | grep -i access-control

Access-Control-Allow-Origin: *
```

### A.5 MXN Series Scan (Negative Result - BanRep)

```bash
$ for id in $(seq 1 200); do
    curl -s "...?idSerie=$id" | jq -r '.[0] | "\(.id)|\(.unidad)|\(.nombre)"' | grep -iE "mxn|peso|mexico"
  done

# Output: Only COP-related "pesos colombianos" hits, no MXN
90|Pesos colombianos por UPAC|Unidad de poder adquisitivo constante (UPAC)
# ... (all COP, no MXN)
```

### A.6 datos.gov.co Socrata Fallback

```bash
$ curl -s "https://www.datos.gov.co/resource/32sa-8pi3.json" | jq '.[0]'

{
  "valor": "3305.38",
  "unidad": "COP",
  "vigenciadesde": "2026-07-10T00:00:00.000",
  "vigenciahasta": "2026-07-10T00:00:00.000"
}

$ curl -sI -H 'Origin: http://localhost:5173' "..." | grep -i access-control
Access-Control-Allow-Origin: *
```

### A.7 Banxico SIE API CORS Verification

```bash
$ curl -sI -H 'Origin: http://localhost:5173' \
    "https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/oportuno" \
    | grep -iE "access-control|http/"

HTTP/1.1 400 Bad Request
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
Access-Control-Allow-Headers: Bmx-Token, Accept, Accept-Encoding, Content-Type
```

### A.8 Banxico Error Response Structure

```bash
$ curl -s -H "Accept: application/json" \
    "https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/oportuno"

{
  "error": {
    "url": "https://www.banxico.org.mx/SieAPIRest/service/v1/token",
    "mensaje": "Token invalido",
    "detalle": "El token enviado no es valido, favor de verificar..."
  }
}
```

### A.9 Banxico Documentation Page Status

```bash
$ curl -sL "https://www.banxico.org.mx/SieAPIRest/service/v1/doc/"

The resource you are looking for has been removed, had its name changed, or is temporarily unavailable.
```

**Note:** Documentation page unreachable. Response shape documented as
"to-be-verified-by-FE-with-fixtures" based on API conventions and error structure observed.

---

## References

- [Banco de la Republica SUAMECA API](https://suameca.banrep.gov.co/)
- [Resolucion Externa 1 de 2018](https://www.banrep.gov.co/sites/default/files/reglamentacion/archivos/dodm146-25052018.pdf) -
  Reserve currency publication mandate
- [Banco de Mexico SIE API](https://www.banxico.org.mx/SieAPIRest/service/v1/token) - Token
  registration
- magic-sky QA audit: `QA/_evidence/audit-fx.md`
- ADR-0007: Navbar Dropdown Interaction Pattern (positioning gap)
- CONTRACTS.md v3.2.0: Currency Domain + Exchange Rates Domain
- docs/performance/budgets.md rev.4: Budget increase approved
