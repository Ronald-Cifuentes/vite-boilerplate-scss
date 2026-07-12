# Performance Analysis - Task 9 Bundle Decomposition

**Date:** 2026-07-11  
**Analyst:** Performance Engineer  
**Subject:** Task-9 Geo-Detection + Lazy Locale Chunking Bundle Analysis

---

## Executive Summary

The main bundle is **240,096 bytes raw** (+3,096 B over 237 KB rev.9 limit) and **75,421 bytes
gzip** (+421 B over 75 KB limit). Lazy chunks are GREEN (GeoDetectionAdapter 2,726 B; ja 1,685 B; zh
1,359 B - all within 3 KB caps).

The overage is NOT caused by geo code leaking into main. The chunking architecture is CORRECT - all
geo detection logic (GPS, IP, reverse geocode, country mapping, provider URLs) is in the lazy chunk.
The overage stems from **ADR-0014 underestimating implementation overhead** for the trigger and lazy
loading infrastructure by ~2,850 B.

**Verdict: REV10** - No relocatable code exists. Budget revision required.

---

## Bundle Measurements

| Metric                    | Value     | Limit (rev.9) | Delta    | Status          |
| ------------------------- | --------- | ------------- | -------- | --------------- |
| Main raw                  | 240,096 B | 237,000 B     | +3,096 B | **FAIL**        |
| Main gzip (level 6)       | 75,421 B  | 75,000 B      | +421 B   | **FAIL**        |
| GeoDetectionAdapter chunk | 2,726 B   | 3,000 B       | -274 B   | PASS (headroom) |
| ja chunk                  | 1,685 B   | 3,000 B       | -1,315 B | PASS            |
| zh chunk                  | 1,359 B   | 3,000 B       | -1,641 B | PASS            |
| CSS raw                   | 29,220 B  | 30,000 B      | -780 B   | PASS            |
| CSS gzip                  | 5,510 B   | 6,500 B       | -990 B   | PASS            |

**Evidence:**

- `stat -f "%z" dist/assets/index-BYHxCj85.js` = 240,096
- `gzip -6 -c dist/assets/index-BYHxCj85.js | wc -c` = 75,421

---

## Decomposition: Where the +3,096 B Came From

### Task-8 Baseline

Task-8 floor: **239,967 B raw** (with zh/ja statically bundled in uncommitted work)

### ADR-0014 Projection vs Reality

| Factor                                 | ADR Projected | Actual   | Gap      |
| -------------------------------------- | ------------- | -------- | -------- |
| zh/ja translations removed             | ~4,100 B      | ~3,044 B | -1,056 B |
| Detection trigger stub added           | ~400 B        | ~1,000 B | +600 B   |
| Lazy loading infrastructure (i18n)     | (not counted) | ~1,250 B | +1,250 B |
| App.tsx handleGeoDetected callback     | (not counted) | ~400 B   | +400 B   |
| Locale signal additions (version/load) | (not counted) | ~500 B   | +500 B   |
| **Net main-bundle change**             | ~-3,700 B     | +129 B   | +3,829 B |

**Root cause:** ADR-0014 estimated 400 B for "detection trigger stub" but the actual implementation
required:

1. **useGeoDetection.ts** (2,119 B source -> ~1,000 B minified): The trigger hook with localStorage
   check, useEffect wrapper, dynamic import, and callback invocation.

2. **translations/index.ts additions** (+1,516 B source -> ~750 B minified): Lazy loading machinery
   including `loadLocale()` function, `isLocaleLoaded()` helper, `loadedLocales` Set, and
   fallback-to-en initialization for zh/ja entries.

3. **locale-signal.ts additions** (+988 B source -> ~500 B minified): `dictionaryVersionSignal` and
   `localeLoadingSignal` signals, plus the lazy-load trigger code inside `setLocale()`.

4. **App.tsx handleGeoDetected** (+2,123 B source -> ~400 B minified): The callback that applies
   detected preferences via setters with validation and localStorage persistence.

### What's Actually In the Lazy Geo Chunk (2,726 B)

The geo chunk correctly contains ALL the geo-specific logic:

| Content                  | Source Size | Notes                                   |
| ------------------------ | ----------- | --------------------------------------- |
| GeoDetectionAdapter.ts   | 3,366 B     | Orchestrator + device language fallback |
| GpsAdapter.ts            | 1,469 B     | navigator.geolocation wrapper           |
| ReverseGeocodeAdapter.ts | 1,657 B     | BigDataCloud API call                   |
| IpGeoAdapter.ts          | 1,785 B     | api.country.is + geojs.io fallback      |
| country-mapping.ts       | 1,359 B     | 7-country mapping table                 |
| providers.ts             | 871 B       | URLs, timeouts, regex                   |
| GeoResult.ts             | 810 B       | Types (stripped but imports remain)     |
| **Total source**         | 11,317 B    | -> 2,726 B minified (24% of source)     |

**Verification:** Provider URLs NOT in main bundle:

```
grep -o 'api\.country\.is\|api\.bigdatacloud\|get\.geojs\.io' dist/assets/index-*.js
# (no matches - correctly in chunk only)
```

---

## Relocation Analysis

### Can 3,096+ B Move to Geo Chunk?

| Main-bundle component            | Size     | Relocatable? | Why                                        |
| -------------------------------- | -------- | ------------ | ------------------------------------------ |
| useGeoDetection hook             | ~1,000 B | NO           | Must run in main to check localStorage     |
| translations/index.ts loadLocale | ~750 B   | NO           | Required for zh/ja language switch (any)   |
| locale-signal.ts version signals | ~500 B   | NO           | Supports i18n lazy load, not just geo      |
| App.tsx handleGeoDetected        | ~400 B   | NO           | Application integration, uses main setters |
| **Total relocatable**            | 0 B      |              |                                            |

The geo chunk has 274 B headroom (2,726 of 3,000). Even if we could relocate code, the chunk cap
would need to increase.

### Could Lazy Loading Machinery Move?

No - the `loadLocale()` function and `dictionaryVersionSignal` support language switching ANYTIME
(user clicks Chinese in dropdown), not just geo-detection. Moving them to the geo chunk would break
non-geo language switching.

---

## Interactivity SLO Verification

| Check                             | Result   | Evidence                                                  |
| --------------------------------- | -------- | --------------------------------------------------------- |
| Detection in useEffect            | **PASS** | `useEffect(() => { ... void runDetection() }, [options])` |
| Dynamic import (non-blocking)     | **PASS** | `await import('../adapters/GeoDetectionAdapter')`         |
| No top-level async                | **PASS** | Trigger fires post-mount only                             |
| hasStoredPrefs() check first      | **PASS** | Skips detection entirely for returning users              |
| Provider URLs not in main         | **PASS** | grep confirms URLs only in chunk                          |
| Detection failure silently caught | **PASS** | `catch { /* app continues with defaults */ }`             |

**Interactivity SLO (<500ms): NOT AT RISK**

The geo detection:

1. Only runs on first visit (hasStoredPrefs check)
2. Fires post-mount via useEffect (doesn't block paint)
3. Loads the 2.7 KB chunk asynchronously
4. Fails gracefully to defaults

---

## Verdict: REV10 Required

No relocatable code exists. The main-bundle overage is caused by legitimate trigger and i18n
lazy-loading infrastructure that cannot be chunked without breaking functionality.

### Proposed Rev.10 Limits

| Chunk     | Rev.9   | Rev.10 (Proposed) | Rationale                             |
| --------- | ------- | ----------------- | ------------------------------------- |
| Main raw  | 237,000 | 241,000           | Floor 240,096 + 904 B headroom        |
| Main gzip | 75,000  | 76,000            | Floor 75,421 + 579 B headroom         |
| Main warn | 236,000 | 240,500           | 500 B under limit                     |
| Gzip warn | 74,500  | 75,500            | 500 B under limit                     |
| Geo chunk | 3,000   | 3,000             | Unchanged (274 B headroom sufficient) |
| ja chunk  | 3,000   | 3,000             | Unchanged (1,315 B headroom)          |
| zh chunk  | 3,000   | 3,000             | Unchanged (1,641 B headroom)          |

### Justification

1. **No trims available:** All main-bundle additions are functional infrastructure
2. **Architecture is correct:** Geo logic IS in lazy chunk as designed
3. **ADR estimate gap:** The ~3,829 B gap is from underestimated trigger complexity, not
   architectural violation
4. **Interactivity unaffected:** Detection is non-blocking, post-mount
5. **Chunking successful:** 5.8 KB moved to lazy chunks (geo + zh + ja combined)

---

## Findings

| ID          | Severity | Status | Description                                               |
| ----------- | -------- | ------ | --------------------------------------------------------- |
| PERF-T9-001 | HIGH     | Open   | Main bundle 3,096 B raw / 421 B gzip over rev.9 limits    |
| PERF-T9-002 | INFO     | Closed | Chunking verified correct - geo logic in lazy chunk       |
| PERF-T9-003 | INFO     | Closed | Interactivity SLO verified - detection non-blocking       |
| PERF-T9-004 | INFO     | Noted  | ADR-0014 trigger estimate gap ~2,850 B (400 B vs 2,650 B) |

---

## Conclusion

- **Main bundle FAILS** rev.9 limits by +3,096 B raw / +421 B gzip
- **Lazy chunks PASS** - all within 3 KB caps with significant headroom
- **Chunking architecture CORRECT** - provider URLs/logic verified in chunk only
- **No relocatable code** - trigger and i18n lazy machinery must stay in main
- **Interactivity SLO NOT AT RISK** - detection is post-mount async
- **Verdict: REV10** required with proposed limits 241 KB raw / 76 KB gzip
