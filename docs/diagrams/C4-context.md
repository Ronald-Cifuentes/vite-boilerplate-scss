# C4 Context Diagram

## System Context

```
+------------------------------------------------------------------+
|                           User                                    |
|                    (Web Browser User)                             |
+------------------------------------------------------------------+
                              |
                              | Interacts via
                              v
+------------------------------------------------------------------+
|                                                                    |
|                    Vite Boilerplate SCSS                          |
|                    (React SPA Frontend)                            |
|                                                                    |
|    A production-ready React 19 boilerplate with:                  |
|    - Multi-language support (i18n)                                 |
|    - Light/Dark theming                                            |
|    - Regional formatting (dates, numbers, currency)               |
|    - SCSS-based design system                                      |
|                                                                    |
+------------------------------------------------------------------+
                              |
          +-------------------+-------------------+
          |                   |                   |
          v                   v                   v
+------------------+ +------------------+ +------------------+
|   Browser        | |   Browser        | |   System         |
|   localStorage   | |   navigator      | |   Preferences    |
|                  | |   (language)     | |   (color-scheme) |
+------------------+ +------------------+ +------------------+
    Persists:           Detects:            Detects:
    - app-locale        - User language     - prefers-color-scheme
    - app-theme         - User region
    - app-region
```

## Actors

| Actor | Description                                               |
| ----- | --------------------------------------------------------- |
| User  | End user interacting with the web application via browser |

## Systems

| System                | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| Vite Boilerplate SCSS | The React SPA being built - this is the system in scope    |
| Browser localStorage  | Web Storage API for persisting user preferences            |
| Browser navigator     | Browser API providing user language/region hints           |
| System Preferences    | OS-level preferences (dark mode) exposed via media queries |

## Interactions

| From     | To                 | Description                                                         |
| -------- | ------------------ | ------------------------------------------------------------------- |
| User     | Frontend           | Interacts with UI: changes language, toggles theme, selects country |
| Frontend | localStorage       | Reads/writes user preferences for persistence across sessions       |
| Frontend | navigator          | Reads browser language on initial load for locale detection         |
| Frontend | System Preferences | Reads prefers-color-scheme for initial theme detection              |
