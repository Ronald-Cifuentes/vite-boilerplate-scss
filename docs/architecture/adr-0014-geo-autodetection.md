# ADR-0014: Geo Auto-Detection and Bundle Chunking

- **Status:** Accepted (Q1 providers approved, Q2 GPS INCLUDED per owner override, Q3 rev.9
  approved - 2026-07-11)
- **Date:** 2026-07-11
- **Deciders:** Architect Agent, Project Owner (GPS override)
- **References:** ADR-0011 (Lazy Locales Option A), budgets.md rev.8->rev.9

## Context

### User Requirement

On first visit (no stored preferences):

- Auto-detect locale, region, and currency from user's location/device
- User-chosen preferences ALWAYS win
- User can change anytime via existing selectors

User also asked about GPS.

### Hard Constraints

1. **Bundle exhausted**: Rev.8 headroom is 33 B raw / 21 B gzip. Any new JS-bearing feature MUST be
   chunked.
2. **New external origins**: IP geolocation and reverse geocoding require third-party services.
3. **No secrets**: SEC-006 lesson - no API keys in bundle.

## Decision

### Part 1: IP Geolocation Provider Selection

#### Provider Reconnaissance (curl-verified 2026-07-11)

**Candidate 1: api.country.is (APPROVED - Primary)**

```
$ curl -sS "https://api.country.is/"
{"ip":"190.69.37.144","country":"CO"}
--- HTTP 200 ---

$ curl -sS -I -H "Origin: http://localhost:5173" "https://api.country.is/" | grep -i access-control
access-control-allow-origin: *
```

- HTTPS: Yes
- CORS: `Access-Control-Allow-Origin: *`
- API Key: Not required
- Free tier: Unlimited (no stated limit, minimal response)
- Response: Minimal - just `ip` and `country` (ISO alpha-2)

**Candidate 2: get.geojs.io (APPROVED - Fallback)**

```
$ curl -sS "https://get.geojs.io/v1/ip/country.json"
{"country":"CO","country_3":"COL","ip":"190.69.37.144","name":"Colombia"}
--- HTTP 200 ---

$ curl -sS -I -H "Origin: http://localhost:5173" "https://get.geojs.io/v1/ip/country.json" | grep -i access-control
access-control-allow-origin: *
```

- HTTPS: Yes
- CORS: `Access-Control-Allow-Origin: *`
- API Key: Not required
- Free tier: Unlimited (community project)

**Candidate 3: ipapi.co - DISQUALIFIED**

```
$ curl -sS "https://ipapi.co/json/"
{"reason": "RateLimited", ...}
--- HTTP 429 ---
```

Rate-limited without API key. Violates no-secrets constraint.

### Part 2: GPS Decision

#### Architect Recommendation (OVERRIDDEN)

The architect recommended OMITTING GPS based on:

1. Permission prompt on first load (hostile UX)
2. Requires reverse geocoding service (second dependency)
3. Country-level resolution sufficient via IP-geo
4. Desktop has no GPS hardware
5. Industry practice (Netflix, Spotify, Amazon): IP-geo only

**Owner Decision (2026-07-11): GPS INCLUDED**

Rationale provided by owner: VPN testing scenario. Under VPN, IP-geo reports VPN exit country while
GPS reports physical location. Physical location should win for accurate detection. Owner accepts
the permission prompt cost knowingly.

#### Reverse Geocoding Provider (curl-verified 2026-07-11)

**BigDataCloud Reverse Geocode Client API:**

```
$ curl -sS "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=6.25&longitude=-75.58&localityLanguage=en"
{
  "latitude": 6.25,
  "longitude": -75.58,
  "countryName": "Colombia",
  "countryCode": "CO",
  "principalSubdivision": "Departamento de Antioquia",
  "city": "Medellin",
  ...
}
--- HTTP 200 ---

$ curl -sS -I -H "Origin: http://localhost:5173" "https://api.bigdatacloud.net/..." | grep -i access-control
access-control-allow-origin: *
```

- HTTPS: Yes
- CORS: `Access-Control-Allow-Origin: *`
- API Key: Not required (client endpoint)
- Response: `countryCode` (ISO alpha-2) - exactly what we need

### Part 3: Detection Precedence Chain

**CRITICAL - Precedence Order:**

```
1. Stored user choice (localStorage)     → ALWAYS WINS
2. GPS (when granted by user)            → Physical location wins over VPN
3. IP geolocation (api.country.is/geojs) → VPN exit or actual IP location
4. Device language (navigator.languages) → Browser language preference
5. Defaults (en/US/USD)                  → Final fallback
```

**Rationale for GPS > IP-geo:** Owner's VPN testing plan. User physically in Colombia using US VPN
should detect as Colombia (GPS), not US (IP). GPS represents true physical location.

### Part 4: Detection Flow (Amended with GPS)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    First Visit Detection Flow                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. Check: Are ALL THREE prefs unset? (localStorage empty)              │
│     ├─ NO  → Skip detection entirely, use stored values                 │
│     └─ YES → Continue to step 2                                         │
│                                                                          │
│  2. Start BOTH in parallel (non-blocking, after mount):                 │
│     ├─ GPS: navigator.geolocation.getCurrentPosition()                  │
│     │   - timeout: 5000ms                                                │
│     │   - maximumAge: 600000ms (10 min cache OK)                        │
│     │   - enableHighAccuracy: false (country-level sufficient)          │
│     │                                                                    │
│     └─ IP-geo: api.country.is (3s) → get.geojs.io (3s) → fail           │
│                                                                          │
│  3. Resolve winner based on what completes:                             │
│     ├─ GPS GRANTED + coords received:                                   │
│     │   └─ Reverse geocode via BigDataCloud                             │
│     │       - URL: api.bigdatacloud.net/data/reverse-geocode-client     │
│     │       - timeout: 3000ms                                            │
│     │       - Validate: countryCode matches ^[A-Z]{2}$ (fail-closed)    │
│     │       └─ SUCCESS → GPS country wins (precedence 2)                │
│     │       └─ FAIL    → Fall through to IP-geo result                  │
│     │                                                                    │
│     ├─ GPS DENIED/TIMEOUT/UNAVAILABLE:                                  │
│     │   └─ Use IP-geo result if available (precedence 3)                │
│     │                                                                    │
│     └─ BOTH FAILED:                                                      │
│         └─ Device language fallback (precedence 4)                       │
│                                                                          │
│  4. Map country to supported values (same as before)                    │
│     ├─ Supported country? (CO/US/ES/GB/MX/CN/JP)                        │
│     │   └─ YES → locale/region/currency from mapping                    │
│     └─ NO → Device language fallback → Defaults                         │
│                                                                          │
│  5. Apply detected values via EXISTING setters                          │
│     - setLocale(detected.locale)                                         │
│     - setRegion(detected.region)                                         │
│     - setCurrency(detected.currency, isExplicit: true)                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### GPS Parameters

| Parameter            | Value    | Rationale                                   |
| -------------------- | -------- | ------------------------------------------- |
| `timeout`            | 5000ms   | Balance between waiting and UX              |
| `maximumAge`         | 600000ms | 10 min cached position OK for country-level |
| `enableHighAccuracy` | false    | Country-level resolution, save battery      |

#### Country-to-Preference Mapping (Unchanged)

| Country Code | Locale | Region | Currency |
| ------------ | ------ | ------ | -------- |
| CO           | es     | CO     | COP      |
| US           | en     | US     | USD      |
| ES           | es     | ES     | EUR      |
| GB           | en     | GB     | GBP      |
| MX           | es     | MX     | MXN      |
| CN           | zh     | CN     | CNY      |
| JP           | ja     | JP     | JPY      |

#### Persistence Decision (Unchanged)

**Decision: Persist detected values as if user-chosen.**

Once detected, values behave like explicit user choices. On subsequent visits, stored values win
(precedence 1, no re-detection).

### Part 5: Chunking Architecture

#### Current Bundle State (rev.8)

| Metric | Limit   | Current   | Headroom |
| ------ | ------- | --------- | -------- |
| Raw    | 240 KB  | 239,967 B | 33 B     |
| Gzip   | 75.5 KB | 75,479 B  | 21 B     |

**Verdict:** ANY new JS breaches budget. Chunking is mandatory.

#### Chunking Decision: Option B (Approved)

```
main.js: current - CJK translations + geo trigger
  - Remove zh.ts (~2.2 KB) and ja.ts (~1.9 KB) from bundle
  - Add detection trigger stub (~400 B)
  - Net: 239,967 - 4,100 + 400 = ~236,267 B

geo.js (lazy): ~2 KB (increased from 1.5 KB for GPS + reverse geocode)
locale-zh.js (lazy): ~2.2 KB
locale-ja.js (lazy): ~1.9 KB
```

### Part 6: Budget Rev.9 (Approved)

| Chunk                       | Max Raw | Max Gzip | Load Condition                     |
| --------------------------- | ------- | -------- | ---------------------------------- |
| main.js                     | 237 KB  | 75 KB    | Always (initial load)              |
| geo.js                      | 3 KB    | 1.5 KB   | First visit only (no stored prefs) |
| locale-zh.js                | 3 KB    | 1 KB     | User selects Chinese               |
| locale-ja.js                | 3 KB    | 1 KB     | User selects Japanese              |
| Total transfer (worst case) | 246 KB  | 78.5 KB  | First-visit Chinese user           |

**Warning thresholds:**

- main.js: 236.5 KB raw / 74.5 KB gzip
- Per-chunk: 2.5 KB raw

## Privacy Documentation

### External Origins

This feature introduces THREE external origins:

| Origin               | Purpose                 | Data Transmitted      | Condition             |
| -------------------- | ----------------------- | --------------------- | --------------------- |
| api.country.is       | IP geolocation          | IP address (inherent) | First visit, no prefs |
| get.geojs.io         | IP geolocation fallback | IP address (inherent) | Primary fails         |
| api.bigdatacloud.net | Reverse geocoding       | Latitude, Longitude   | GPS granted only      |

### GPS Privacy Notice

**What happens when GPS is used:**

- Browser shows permission prompt (user must grant)
- If granted: coordinates (lat/lng) sent to `api.bigdatacloud.net`
- Service returns country code based on coordinates
- Coordinates are NOT stored locally - only the detected preferences

**CRITICAL:** Coordinates are transmitted to a third party ONLY after the user explicitly grants the
browser's geolocation permission. Users who deny the prompt never have coordinates transmitted.

### IP Geolocation Privacy Notice

**What happens:**

- On first visit with no stored preferences, the app makes a request to `api.country.is` (or
  fallback `get.geojs.io`)
- This request transmits your IP address to the third-party service
- The service returns your approximate country based on IP

**Data transmitted:** IP address only (inherent in any HTTP request)

**Data stored locally:** Detected locale/region/currency preferences (localStorage)

**User control:**

- Users can change detected preferences anytime via UI
- Clearing localStorage triggers re-detection on next visit
- No tracking, no cookies set by geo services

### SECURITY-AUDIT Entries

```
SEC-007: IP Geolocation External Origins
- Severity: LOW (accepted 2026-07-11)
- Surface: Client IP transmitted to api.country.is / get.geojs.io
- Mitigation: HTTPS only, no credentials, fail-closed, timeout 3s
- Privacy: Documented in ADR-0014

SEC-008: GPS Reverse Geocoding External Origin
- Severity: LOW (accepted 2026-07-11)
- Surface: Coordinates transmitted to api.bigdatacloud.net
- Mitigation: HTTPS only, no credentials, fail-closed, timeout 3s
- Privacy: Only after user grants browser permission; documented in ADR-0014
- Condition: GPS path only (user must grant permission)
```

## Module Contract

### Location

```
src/geo-detection/
  adapters/
    GeoDetectionAdapter.ts    # Fetch + fallback chain
    GpsAdapter.ts             # navigator.geolocation wrapper
    ReverseGeocodeAdapter.ts  # BigDataCloud API
  config/
    country-mapping.ts        # ISO code -> locale/region/currency
    providers.ts              # API endpoints + timeouts
  hooks/
    useGeoDetection.ts        # Runs detection on mount if needed
  types/
    GeoResult.ts              # Detection result types
  index.ts                    # Barrel export (lazy chunk entry)
```

### Test IDs

| Element           | Test ID                                          |
| ----------------- | ------------------------------------------------ |
| Detection trigger | `geo-detection-trigger` (internal, not rendered) |

### Mocking Seam for E2E

```typescript
// e2e/helpers/geo-mock.ts

// IP geolocation mocks
export async function mockGeoResponse(page: Page, countryCode: string) {
  await page.route('**/api.country.is/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ip: '1.2.3.4', country: countryCode }),
    })
  })
  await page.route('**/get.geojs.io/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ country: countryCode, ip: '1.2.3.4' }),
    })
  })
}

export async function mockGeoFailure(page: Page) {
  await page.route('**/api.country.is/**', route => route.abort())
  await page.route('**/get.geojs.io/**', route => route.abort())
}

// Reverse geocode mock
export async function mockReverseGeocode(page: Page, countryCode: string) {
  await page.route('**/api.bigdatacloud.net/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ countryCode, countryName: 'Mocked' }),
    })
  })
}

export async function mockReverseGeocodeFailure(page: Page) {
  await page.route('**/api.bigdatacloud.net/**', route => route.abort())
}

// GPS geolocation mock (Playwright context)
export async function mockGpsGranted(
  context: BrowserContext,
  coords: { lat: number; lng: number }
) {
  await context.setGeolocation({ latitude: coords.lat, longitude: coords.lng })
  await context.grantPermissions(['geolocation'])
}

export async function mockGpsDenied(context: BrowserContext) {
  // Don't grant permission - browser will deny
  await context.clearPermissions()
}
```

### E2E Test Matrix (Expanded for GPS)

| Scenario                   | Mocks                           | Expected Result                  |
| -------------------------- | ------------------------------- | -------------------------------- |
| GPS granted + CO coords    | GPS=CO, IP=any                  | es/CO/COP (GPS wins)             |
| GPS granted + US coords    | GPS=US, IP=any                  | en/US/USD (GPS wins)             |
| VPN scenario               | GPS=CO, IP=US                   | es/CO/COP (GPS wins over VPN IP) |
| GPS denied + CO IP         | GPS denied, IP=CO               | es/CO/COP (IP fallback)          |
| GPS timeout + JP IP        | GPS timeout, IP=JP              | ja/JP/JPY (IP fallback)          |
| GPS + reverse geocode fail | GPS=coords, reverse fail, IP=ES | es/ES/EUR (IP fallback)          |
| All fail                   | GPS denied, IP fail             | Device lang fallback             |
| Unsupported GPS country    | GPS=FR, IP=FR                   | Device lang fallback             |
| Returning user with prefs  | Any mocks, localStorage set     | Stored prefs win                 |
| Colombia IP (no GPS)       | GPS denied, IP=CO               | es/CO/COP                        |
| US IP (no GPS)             | GPS denied, IP=US               | en/US/USD                        |
| Spain IP (no GPS)          | GPS denied, IP=ES               | es/ES/EUR                        |
| UK IP (no GPS)             | GPS denied, IP=GB               | en/GB/GBP                        |
| Mexico IP (no GPS)         | GPS denied, IP=MX               | es/MX/MXN                        |
| China IP (no GPS)          | GPS denied, IP=CN               | zh/CN/CNY                        |
| Japan IP (no GPS)          | GPS denied, IP=JP               | ja/JP/JPY                        |

## Consequences

### Positive

- First-visit UX dramatically improved (automatic localization)
- GPS provides accurate detection under VPN (owner's use case)
- No API keys required (SEC-006 compliant)
- Bundle headroom restored via lazy chunks
- Comprehensive e2e mock seam for both paths

### Negative

- Three external origins (privacy documentation required)
- GPS permission prompt on first visit (owner accepted cost)
- Lazy chunk complexity (dynamic imports)

### Neutral

- GPS included per owner override (architect recommendation recorded)

## References

- ADR-0011: CJK Locales and Lazy Loading Option A
- budgets.md rev.9
- api.country.is: https://country.is/
- geojs.io: https://www.geojs.io/
- BigDataCloud Reverse Geocode:
  https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api
