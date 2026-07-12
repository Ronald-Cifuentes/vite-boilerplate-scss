# ADR-0011: CJK Locales (Chinese/Japanese) and CNY/JPY Exchange Rates

- **Status:** Accepted (both decisions ratified by project owner, 2026-07-10)
- **Date:** 2026-07-10
- **Deciders:** Architect Agent + Project Owner
- **Task:** 6 (Iteration 1)
- **Supersedes:** None
- **Extends:** ADR-0010 (exchange rates architecture)

---

## Context

### User Requirements (Task 6)

Add China and Japan as supported regions/languages/currencies:

1. Region CN with language zh and currency CNY
2. Region JP with language ja and currency JPY
3. Complete zh (Chinese Simplified) and ja (Japanese) translations
4. Real exchange rate backed conversion for CNY and JPY

### Current State

- Supported locales: en, es (2)
- Supported regions: US, ES, GB, MX, CO (5)
- Supported currencies: COP, USD, EUR, GBP, MXN (5)
- Exchange rate sources: BanRep SUAMECA (USD/EUR/GBP), Banxico SIE (MXN via cross-rate)
- Bundle: 228,417 B raw / 71,880 B gzip vs budget rev.5: 229,000 / 72,000

---

## Rate Source Verification (Curl Evidence)

### CNY: BanRep SUAMECA Series 28 (VERIFIED)

**Request:**

```bash
curl -s "https://suameca.banrep.gov.co/.../consultaInformacionSerie?idSerie=28"
```

**Response (2026-07-10):**

```json
{
  "id": 28,
  "nombre": "Reminbi Chino - COP/CNY - Tasa media",
  "unidad": "COP/CNY",
  "valor": 487.62345,
  "fecha": "10/07/2026"
}
```

**CORS Verified:**

```
HTTP/1.1 200
Access-Control-Allow-Origin: *
```

**Rate Orientation:** COP per 1 CNY (same as USD/EUR/GBP series) - no cross-rate needed.

**Sanity Check:**

- 4500 COP / 487.62 = 9.23 CNY
- Cross-check: TRM 3305.38 / (USD/CNY ~6.8) = ~486 COP/CNY -- matches

### JPY: BanRep SUAMECA Series 33 (VERIFIED)

**Request:**

```bash
curl -s "https://suameca.banrep.gov.co/.../consultaInformacionSerie?idSerie=33"
```

**Response (2026-07-10):**

```json
{
  "id": 33,
  "nombre": "Yen japones - COP/JPY - Tasa media",
  "unidad": "COP/JPY",
  "valor": 20.42564,
  "fecha": "10/07/2026"
}
```

**CORS Verified:**

```
HTTP/1.1 200
Access-Control-Allow-Origin: *
```

**Rate Orientation:** COP per 1 JPY (same orientation as other series).

**Sanity Check:**

- 4500 COP / 20.43 = 220 JPY (0 decimals per JPY convention)
- At TRM 3305.38 and USD/JPY ~161, COP/JPY = 3305.38/161 = 20.53 -- matches

### Alternative Sources (Not Needed)

- **Banxico SIE:** Has JPY/MXN and CNY/MXN series, but would require two-hop cross-rate. SUAMECA
  direct rates are superior.
- **Frankfurter.app (ECB):** CORS-open, has JPY/CNY vs EUR. Would require composition with BanRep
  EUR series. Not needed given SUAMECA availability.

---

## Decision: Rate Sources

### Q1 — RESOLVED: SUAMECA series 28/33 (orchestrator independently curl-verified: HTTP 200, Access-Control-Allow-Origin: *, unidad COP/CNY and COP/JPY, periodicity Diaria; architecturally decided — no trade-off remained)

**Recommendation:** Use BanRep SUAMECA for both CNY (series 28) and JPY (series 33).

**Rationale:**

1. Direct COP/CNY and COP/JPY rates - no cross-rate composition needed
2. Same source as existing USD/EUR/GBP - consistent architecture
3. Same fail-closed validation pattern (unidad field assertion)
4. CORS-open, no token required
5. Same 24h staleness bound applies

**Alternative considered:** Banxico cross-rate (would need USD intermediate) - rejected as more
complex and introduces second dependency chain.

**Owner decision needed:** Confirm SUAMECA series 28/33 for CNY/JPY.

---

## Decision: Bundle Strategy

### Q2 — RESOLVED: Option B ratified by owner 2026-07-10 — single bundle, budget rev.6 (233,000 raw / 74,000 gzip; warnings 232K / 73.5K). budgets.md rev.6 written. Lazy chunks deferred until locale count warrants.

The addition of zh and ja translations will breach the current budget.

**Current State:**

- Raw: 228,417 B / Budget: 229,000 B (headroom: 583 B)
- Gzip: 71,880 B / Budget: 72,000 B (headroom: 120 B)

**Estimated Additions:**

| Component                    | Raw Estimate | Gzip Estimate |
| ---------------------------- | ------------ | ------------- |
| zh.ts translations (~39 keys | ~1,000 B     | ~400 B        |
| ja.ts translations (~39 keys | ~1,200 B     | ~450 B        |
| Region CN/JP metadata        | ~200 B       | ~80 B         |
| Currency CNY/JPY metadata    | ~200 B       | ~80 B         |
| BANREP_SERIES 28/33          | ~50 B        | ~20 B         |
| CURRENCY_DECIMALS/SYMBOLS    | ~80 B        | ~30 B         |
| LOCALE_METADATA zh/ja        | ~150 B       | ~60 B         |
| currency.cny/.jpy in en/es   | ~100 B       | ~40 B         |
| **Total**                    | **~3,000 B** | **~1,160 B**  |

### Option A: Lazy Locale Chunks

**Main bundle changes:**

- Remove es.ts inline: saves ~1,200 B minified
- Add async loader code: adds ~400 B
- Keep en.ts (default fallback): unchanged
- Add region/currency/rate entries: ~600 B
- **Net main bundle delta:** ~-200 B (slight reduction)

**New per-locale chunks:**

- es.js: ~1,200 B
- zh.js: ~1,000 B
- ja.js: ~1,200 B

**Budget structure:**

| Component        | Raw Limit | Gzip Limit |
| ---------------- | --------- | ---------- |
| Main JS          | 229 KB    | 72 KB      |
| Per-locale chunk | 2 KB each | 1 KB each  |
| Total (worst)    | 231 KB    | 73 KB      |

**Trade-offs:**

- (+) Main bundle stays flat; only users of that locale pay the cost
- (+) Future locales add chunks, not main bundle weight
- (-) Async loading complexity in I18nProvider
- (-) Need loading state during locale chunk fetch
- (-) FOUC script must coordinate with async locale restore
- (-) Tests must handle async locale loading
- (-) Edge case: chunk fetch fails after localStorage says zh -> fallback to en

### Option B: Single Bundle, Budget Rev.6

**Projected totals:**

- Raw: 228,417 + 3,000 = ~231,400 B
- Gzip: 71,880 + 1,160 = ~73,000 B

**Proposed budget rev.6:**

| Metric           | Warning | Limit  |
| ---------------- | ------- | ------ |
| JS Bundle (raw)  | 232 KB  | 233 KB |
| JS Bundle (gzip) | 73 KB   | 74 KB  |

**Trade-offs:**

- (+) Simpler implementation - current synchronous i18n stays unchanged
- (+) No async loading edge cases
- (+) Tests unchanged
- (-) ALL users pay ~3 KB more transfer, even if they only use en
- (-) Future locales continue to grow main bundle

**Owner decision needed:** Option A (lazy chunks) or Option B (budget rev.6)?

---

## Design Decisions (No Human Decision Needed)

### Locale Configuration

**SUPPORTED_LOCALES order:** `['en', 'es', 'zh', 'ja']` (append only)

**LOCALE_METADATA:**

```typescript
zh: { code: 'zh', nativeName: '中文', englishName: 'Chinese', direction: 'ltr' },
ja: { code: 'ja', nativeName: '日本語', englishName: 'Japanese', direction: 'ltr' },
```

**Precedent:** Existing `es.nativeName = 'Espanol'` uses non-ASCII. zh/ja follow same pattern.

### Region Configuration

**SUPPORTED_REGIONS order:** `['US', 'ES', 'GB', 'MX', 'CO', 'CN', 'JP']` (append only)

**REGION_METADATA:**

```typescript
CN: {
  code: 'CN',
  nativeName: '中国',
  englishName: 'China',
  dateLocale: 'zh-CN',
  numberLocale: 'zh-CN',
  currency: 'CNY',
},
JP: {
  code: 'JP',
  nativeName: '日本',
  englishName: 'Japan',
  dateLocale: 'ja-JP',
  numberLocale: 'ja-JP',
  currency: 'JPY',
},
```

**Policy decision:** Region nativeName uses native script (中国, 日本) for consistency with locale
nativeName pattern. Note: existing regions use ASCII (e.g., 'Espana' not 'Espana') but locales use
non-ASCII ('Espanol'). This ADR chooses to follow the locale pattern for region nativeName going
forward since it's user-facing in the country selector.

### Currency Configuration

**SUPPORTED_CURRENCIES order:** `['COP', 'USD', 'EUR', 'GBP', 'MXN', 'CNY', 'JPY']` (append only)

**Yen Symbol Collision (CNY and JPY both use '¥'):**

CLDR practice distinguishes:

- CNY: 'CN¥' or '¥' with 'CNY' suffix
- JPY: '¥' or 'JP¥'

**Decision:** Use distinct prefixes in CURRENCY_SYMBOLS:

```typescript
CNY: 'CN¥',  // Chinese Yuan
JPY: '¥',    // Japanese Yen (more common usage)
```

**CURRENCY_DECIMALS:**

```typescript
CNY: 2,  // Standard 2 decimals
JPY: 0,  // Yen has no minor units
```

**formatAmount verification:** The existing implementation handles 0-decimals correctly via
`toFixed(0)` which produces no decimal point, and the `d ? ... : x` conditional excludes the decimal
part when undefined.

### Translation Keys

**New currency keys (in ALL locale files):**

```typescript
currency: {
  // ...existing
  cny: string,  // 'Chinese Yuan' / 'Yuan Chino' / '人民币' / '人民元'
  jpy: string,  // 'Japanese Yen' / 'Yen Japones' / '日元' / '日本円'
}
```

**TranslationKeys type enforcement:** Adding keys to TranslationDictionary interface causes
compile-time errors in any locale file missing the key.

### Exchange Rate Series Configuration

**BANREP_SERIES extension:**

```typescript
export const BANREP_SERIES: Record<'USD' | 'EUR' | 'GBP' | 'CNY' | 'JPY', number> = {
  USD: 1,
  EUR: 30,
  GBP: 31,
  CNY: 28,
  JPY: 33,
}
```

**Fail-closed validation:** Same pattern as existing - assert `unidad` field matches `COP/CNY` or
`COP/JPY` exactly.

### Keyboard Navigation Updates

**Language dropdown:** 2 options -> 4 options

- End key target: en (index 0) -> ja (index 3)
- Wrap from ja -> en

**Country dropdown:** 5 options -> 7 options

- End key target: CO (index 4) -> JP (index 6)
- Wrap from JP -> US

**Currency dropdown:** 5 options -> 7 options

- End key target: MXN (index 4) -> JPY (index 6)
- Wrap from JPY -> COP

### syncCurrencyToRegion Mapping

```typescript
CN -> CNY
JP -> JPY
```

### Translation Provenance

**zh.ts and ja.ts:** Machine-authored translations requiring native speaker review before production
use. This MUST be flagged in the delivery report.

---

## Consequences

### Positive

- Direct COP/CNY and COP/JPY rates from authoritative Colombian central bank source
- No additional external dependencies (same SUAMECA endpoint)
- Consistent fail-closed validation with existing rates
- JPY 0-decimals handled correctly by existing formatAmount

### Negative

- Bundle size increase (mitigated by Option A or accepted via Option B)
- zh/ja translations are machine-authored (flagged for native review)

### Risks

- SUAMECA series 28/33 availability not contractually guaranteed (same risk as existing series)
- Translation quality requires native speaker review

---

## Open Questions

1. **Q1 (Rate Source):** RESOLVED — SUAMECA series 28 (CNY) / 33 (JPY), curl-verified twice
   (architect + orchestrator).
2. **Q2 (Bundle Strategy):** RESOLVED — Option B, budget rev.6 (233 KB raw / 74 KB gzip),
   owner-ratified 2026-07-10.

---

## References

- ADR-0010: Currency Conversion and Positioning
- BanRep SUAMECA series catalog (scanned 1-100 for CNY/JPY availability)
- CLDR currency symbol guidelines
- docs/performance/budgets.md rev.5
