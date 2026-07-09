# C4 Container Diagram

## Container View

```
+-----------------------------------------------------------------------------------+
|                              Vite Boilerplate SCSS                                |
|                                  (React SPA)                                       |
+-----------------------------------------------------------------------------------+
|                                                                                    |
|  +-----------------------------------------------------------------------------+  |
|  |                           Application Shell                                  |  |
|  |                          (src/shared/components/App)                         |  |
|  |                                                                              |  |
|  |  Responsibilities:                                                           |  |
|  |  - Composes providers (Theme, Region, I18n)                                  |  |
|  |  - Renders Navbar and main content                                          |  |
|  |  - Entry point for React component tree                                      |  |
|  +-----------------------------------------------------------------------------+  |
|         |                    |                    |                    |          |
|         v                    v                    v                    v          |
|  +--------------+    +--------------+    +--------------+    +--------------+     |
|  |    Theme     |    |   Region     |    |    i18n      |    |   Features   |     |
|  |   Domain     |    |   Domain     |    |   Domain     |    |              |     |
|  |              |    |              |    |              |    |  - greeting  |     |
|  | - Signals    |    | - Signals    |    | - Signals    |    |  - navbar    |     |
|  | - Provider   |    | - Provider   |    | - Provider   |    |              |     |
|  | - Hook       |    | - Hook       |    | - Hook       |    |              |     |
|  | - Adapter    |    | - Adapter    |    | - Adapter    |    |              |     |
|  +--------------+    +--------------+    +--------------+    +--------------+     |
|         |                    |                    |                               |
|         v                    v                    v                               |
|  +-----------------------------------------------------------------------------+  |
|  |                         Design System (SCSS)                                 |  |
|  |                        (src/shared/ds/)                                      |  |
|  |                                                                              |  |
|  |  Layers (ITCSS):                                                             |  |
|  |  Settings -> Tools -> Generic -> Elements -> Objects -> Components -> Utils  |  |
|  |                                                                              |  |
|  |  Themes:                                                                     |  |
|  |  - Light mode CSS custom properties                                          |  |
|  |  - Dark mode CSS custom properties                                           |  |
|  +-----------------------------------------------------------------------------+  |
|         |                    |                    |                               |
|         v                    v                    v                               |
|  +--------------+    +--------------+    +--------------+                         |
|  |  Shared      |    |   Assets     |    |   Entry      |                         |
|  |  Components  |    |              |    |   Point      |                         |
|  |              |    | - Images     |    |              |                         |
|  | - Button     |    | - Fonts      |    | - main.tsx   |                         |
|  | - IconButton |    |              |    | - main.scss  |                         |
|  | - Link       |    |              |    | - index.html |                         |
|  +--------------+    +--------------+    +--------------+                         |
|                                                                                    |
+-----------------------------------------------------------------------------------+
                              |
                              | Builds to
                              v
+-----------------------------------------------------------------------------------+
|                              Static Assets (dist/)                                |
|                                                                                    |
|  - index.html (with FOUC prevention script)                                       |
|  - assets/*.js (hashed, cached 1 year)                                            |
|  - assets/*.css (hashed, cached 1 year)                                           |
+-----------------------------------------------------------------------------------+
```

## Containers

| Container         | Technology           | Description                                                  |
| ----------------- | -------------------- | ------------------------------------------------------------ |
| Application Shell | React 19             | Root component composing all providers and layout            |
| Theme Domain      | TypeScript + Signals | Manages light/dark theme state with localStorage persistence |
| Region Domain     | TypeScript + Signals | Manages country/region for Intl formatting                   |
| i18n Domain       | TypeScript + Signals | Manages locale and translations                              |
| Features          | React Components     | Business features (greeting, navbar with controls)           |
| Design System     | SCSS + CSS Modules   | ITCSS-layered token-first styling system                     |
| Shared Components | React Components     | Reusable UI primitives (Button, IconButton, Link)            |
| Assets            | Static Files         | Images, fonts, and other static resources                    |
| Entry Point       | TypeScript + HTML    | Application bootstrap (main.tsx, index.html)                 |
| Static Assets     | HTML/JS/CSS          | Production build output served by web server                 |

## Data Flow

1. User interacts with Navbar controls (IconButtons)
2. Controls call domain hooks (useTheme, useRegion, useTranslation)
3. Hooks update signals (module-level reactive state)
4. Providers sync state to DOM (data-theme, html lang) and localStorage
5. CSS custom properties respond to data-theme changes
6. Components re-render with new translations/formatting
