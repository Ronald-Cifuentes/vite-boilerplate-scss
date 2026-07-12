# Vite Boilerplate SCSS

A production-ready React template with i18n, theming, geo-detection, currency conversion, and
mobile-first design.

## Features

- **Internationalization**: 4 locales (en, es, zh, ja) with lazy-loaded CJK translations
- **Geo-detection**: Automatic locale/region/currency via IP + optional GPS
- **Currency conversion**: Live rates via BanRep SUAMECA + Banxico SIE (7 currencies)
- **Theming**: Light/dark/system with OS preference following
- **Mobile menu**: Fullscreen overlay at <768px with focus trap
- **Accessibility**: WCAG 2.1 AA, aria-labels, screen reader announcements, prefers-reduced-motion

## Requirements

- Node.js 20+
- pnpm (never npm)

### Environment Variables

```bash
# Optional: enables MXN exchange rates via Banxico
VITE_BANXICO_TOKEN=your_token_here
```

Copy `.env.example` to `.env` for local development.

## Scripts

| Command         | Description                               |
| --------------- | ----------------------------------------- |
| `pnpm dev`      | Start dev server (localhost:5173)         |
| `pnpm build`    | TypeScript check + production build       |
| `pnpm preview`  | Preview production build (localhost:4173) |
| `pnpm test`     | Run Jest with 100% coverage               |
| `pnpm test:e2e` | Run Playwright e2e tests                  |
| `pnpm lint`     | ESLint check                              |
| `pnpm format`   | Prettier format                           |

## Project Structure

```
src/
  features/           # Feature modules (greeting, navbar, mobile-menu)
  i18n/               # Internationalization (locales, signals, translations)
  theme/              # Theming (signals, adapters, config)
  region/             # Region/country management
  currency/           # Currency selection and formatting
  exchange-rates/     # Live rate fetching (BanRep, Banxico)
  geo-detection/      # IP/GPS location detection
  shared/             # Shared components (App, Dropdown, Button, ErrorBoundary)
```

Each component follows folder-by-feature:

```
ComponentName/
  index.ts
  ComponentName.tsx
  ComponentName.spec.tsx
  ComponentName.module.scss
  interfaces.ts
```

## Documentation

- [Architecture Contracts](docs/architecture/CONTRACTS.md) - Binding interfaces
- [Performance Budgets](docs/performance/budgets.md) - Bundle size limits
- [Requirements Checklist](docs/REQUIREMENTS-CHECKLIST.md) - Implementation tracking
- ADRs in `docs/architecture/adr-*.md`

### Adding a Feature

See `docs/architecture/CONTRACTS.md` for the full process. Key steps:

1. Create domain folder under `src/`
2. Add translation keys to all 4 locale files
3. Write tests first (TDD)
4. Update CONTRACTS.md with new interfaces

### Adding a Locale

1. Add to `SupportedLocale` union in `src/i18n/types/Locale.ts`
2. Add to `SUPPORTED_LOCALES` array and `LOCALE_METADATA` in `src/i18n/config/locales.ts`
3. Create translation file in `src/i18n/translations/`
4. Add lazy loader in `src/i18n/translations/index.ts` (for non-Latin scripts)
5. Update tests

## External Origins

The app contacts these external services:

| Origin                 | Purpose                                           |
| ---------------------- | ------------------------------------------------- |
| `www.banrep.gov.co`    | USD/EUR/GBP/CNY/JPY exchange rates (SUAMECA)      |
| `www.banxico.org.mx`   | MXN exchange rates (SIE) - requires token         |
| `api.country.is`       | IP-based geo-detection (primary)                  |
| `get.geojs.io`         | IP-based geo-detection (fallback)                 |
| `api.bigdatacloud.net` | GPS reverse geocoding (when user grants location) |

**Privacy**: GPS coordinates are only sent when the user explicitly grants browser location
permission.

## License

MIT
