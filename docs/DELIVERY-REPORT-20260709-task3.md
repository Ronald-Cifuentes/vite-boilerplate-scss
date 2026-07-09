# Delivery Report — Task 3: Tri-State Theme Mode Button

**Date:** 2026-07-09 **Orchestrator sign-off:** 20260709-1936 **Status:** ✅ DELIVERED

---

## Scope (user requirement, verbatim)

> "Dark mode cannot be a dropdown menu because that would confuse or annoy the user; it's better if
> it's a button that changes as it's pressed. It will have three modes that swap the icon: light
> mode, dark mode, and system (which will use the one the user has for their system)."

Supersession #2: replaces the task-2 ThemeDropdown for the theme control only. Language, country,
and currency dropdowns remain per ADR-0007.

## What was delivered

- **ThemeModeButton** (`src/features/navbar/components/ThemeModeButton/`): plain icon-only button
  (no popup semantics), press cycles **light → dark → system → light**, icon swaps per mode
  (`MdLightMode` / `MdDarkMode` / `MdSettingsBrightness`), dynamic localized `aria-label`, selection
  announced via aria-live, ≥44px touch target, native Enter/Space activation.
- **Tri-state theme domain** (`src/theme/`): `ThemePreference` (`light|dark|system`, persisted,
  **default `system`** — preserves prior observable behavior for new users) resolved to an effective
  theme; **live OS-following** via a `matchMedia('prefers-color-scheme')` change listener with
  cleanup — switching the OS scheme flips the app instantly when in system mode, and explicit
  light/dark ignore OS changes.
- **FOUC script** (`index.html`): resolves stored `system` / absent / invalid values via matchMedia
  at parse time; now allowlist-validates stored values (security posture improved — SEC-005
  reduced).
- **Deleted** ThemeDropdown (directory, exports, orphaned i18n keys); legacy stored `light`/`dark`
  values remain honored (back-compat e2e).
- **Docs**: ADR-0009, CONTRACTS v3.1.0 (§3 domain, §7.2 supersession, §10 criteria), 47 THEME3
  checklist rows, QA report, security audit Appendix C.

## Final gate evidence (independently re-run by orchestrator)

| Gate                                | Result | Evidence                                                                                                                                                   |
| ----------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lint / typecheck / build            | ✅     | exit 0                                                                                                                                                     |
| Unit+integration                    | ✅     | 39 suites, 490 tests                                                                                                                                       |
| Coverage                            | ✅     | 100% — 629/629 / 140/140 / 133/133 / 598/598                                                                                                               |
| E2E                                 | ✅     | **75/75** — tri-state cycle, live OS-follow both directions w/o reload, FOUC matrix, default-system, back-compat, remaining-dropdown keyboard suite intact |
| A11y                                | ✅     | no aria-haspopup, per-mode localized aria-label, announcer, Enter/Space, icon-only                                                                         |
| Mobile-first / decorative / statics | ✅     | 0 max-width; QA sweep; 0 TODO/secrets                                                                                                                      |
| Bundle (rev.3)                      | ✅     | 221,845 raw ≤ 224,000; 69,411 gzip ≤ 70,000                                                                                                                |
| Security                            | ✅     | deps untouched; FOUC sink-free, SEC-005 **reduced** (new allowlist)                                                                                        |
| Traceability                        | ✅     | THEME3 47/47; project 183 passed / 0 failed / 11 superseded                                                                                                |

## Notes and limitations (with evidence)

- **Bundle grew +1,246 B raw** (vs architect estimate of −100..−200 B): two new signals, matchMedia
  listener, third icon, and i18n keys. Within budget, honestly self-reported by the implementing
  agent. **Remaining headroom is small: 2,155 B raw / 589 B gzip** — the next feature will likely
  force code-splitting or another owner budget decision.
- E2E runs Chromium-only; OS-scheme changes are emulated via `page.emulateMedia`, not a real OS
  toggle.
- QA cycle 1 passed with zero defects — no fix rounds were needed for this task.

## Acceptance status

**ACCEPTED** — all CONTRACTS v3.1.0 §10 criteria pass (docs/qa/QA-REPORT-20260709-task3-cycle1.md);
QA report empty; security triage clean; sign-off log `logs/20260709-1936-Orchestrator_Master.md`.
