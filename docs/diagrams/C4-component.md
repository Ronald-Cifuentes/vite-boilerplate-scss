# C4 Component Diagram

## Component View - Domain Layer

```
+-----------------------------------------------------------------------------------+
|                              Domain Components                                     |
+-----------------------------------------------------------------------------------+

+------------------------------- Theme Domain -------------------------------------+
|                                                                                    |
|  +------------------+     +------------------+     +------------------+            |
|  |   ThemePort      |     |   ThemeProvider  |     |   useTheme       |            |
|  |   (Interface)    |<----|   (Adapter)      |---->|   (Hook)         |            |
|  |                  |     |                  |     |                  |            |
|  | - mode           |     | - Syncs DOM      |     | - Returns        |            |
|  | - toggle()       |     | - Persists       |     |   ThemePort      |            |
|  | - setMode()      |     |                  |     |                  |            |
|  +------------------+     +------------------+     +------------------+            |
|           ^                       |                                                |
|           |                       v                                                |
|  +------------------+     +------------------+     +------------------+            |
|  |   ThemeMode      |     |   themeSignal    |     |   localStorage   |            |
|  |   (Type)         |     |   (Signal)       |     |   Adapter        |            |
|  |                  |     |                  |     |                  |            |
|  | - 'light'        |     | - Reactive state |     | - persistTheme() |            |
|  | - 'dark'         |     | - Module-level   |     | - loadTheme()    |            |
|  +------------------+     +------------------+     +------------------+            |
|                                                                                    |
+-----------------------------------------------------------------------------------+

+------------------------------- Region Domain ------------------------------------+
|                                                                                    |
|  +------------------+     +------------------+     +------------------+            |
|  |   RegionPort     |     |  RegionProvider  |     |   useRegion      |            |
|  |   (Interface)    |<----|   (Adapter)      |---->|   (Hook)         |            |
|  |                  |     |                  |     |                  |            |
|  | - region         |     | - Syncs state    |     | - Returns        |            |
|  | - cycleRegion()  |     | - Persists       |     |   RegionPort     |            |
|  | - formatDate()   |     |                  |     |                  |            |
|  | - formatNumber() |     |                  |     |                  |            |
|  +------------------+     +------------------+     +------------------+            |
|           ^                       |                                                |
|           |                       v                                                |
|  +------------------+     +------------------+     +------------------+            |
|  | SupportedRegion  |     |  regionSignal    |     |   localStorage   |            |
|  |   (Type)         |     |   (Signal)       |     |   Adapter        |            |
|  |                  |     |                  |     |                  |            |
|  | - 'US'|'ES'|...  |     | - Reactive state |     | - persistRegion()|            |
|  +------------------+     +------------------+     +------------------+            |
|                                                                                    |
+-----------------------------------------------------------------------------------+

+------------------------------- i18n Domain --------------------------------------+
|                                                                                    |
|  +------------------+     +------------------+     +------------------+            |
|  |   Translator     |     |   I18nProvider   |     |  useTranslation  |            |
|  |   (Port)         |<----|   (Adapter)      |---->|   (Hook)         |            |
|  |                  |     |                  |     |                  |            |
|  | - t(key)         |     | - Syncs html lang|     | - Returns        |            |
|  | - locale         |     | - Persists       |     |   Translator     |            |
|  | - setLocale()    |     |                  |     |                  |            |
|  +------------------+     +------------------+     +------------------+            |
|           ^                       |                                                |
|           |                       v                                                |
|  +------------------+     +------------------+     +------------------+            |
|  | SupportedLocale  |     |  localeSignal    |     |  translations    |            |
|  |   (Type)         |     |   (Signal)       |     |   (Dictionaries) |            |
|  |                  |     |                  |     |                  |            |
|  | - 'en'|'es'      |     | - Reactive state |     | - en.ts, es.ts   |            |
|  +------------------+     +------------------+     +------------------+            |
|                                                                                    |
+-----------------------------------------------------------------------------------+
```

## Component View - Feature Layer

```
+-----------------------------------------------------------------------------------+
|                              Feature Components                                    |
+-----------------------------------------------------------------------------------+

+------------------------------- Navbar Feature -----------------------------------+
|                                                                                    |
|  +------------------+                                                              |
|  |     Navbar       |                                                              |
|  |   (Component)    |                                                              |
|  |                  |                                                              |
|  | Composes:        |                                                              |
|  +--------+---------+                                                              |
|           |                                                                        |
|           +--------------------+--------------------+                              |
|           |                    |                    |                              |
|           v                    v                    v                              |
|  +------------------+  +------------------+  +------------------+                  |
|  |LanguageCycleBtn  |  | ThemeModeToggle  |  |CountryCycleBtn   |                  |
|  |   (Component)    |  |   (Component)    |  |   (Component)    |                  |
|  |                  |  |                  |  |                  |                  |
|  | Uses:            |  | Uses:            |  | Uses:            |                  |
|  | - useTranslation |  | - useTheme       |  | - useRegion      |                  |
|  | - IconButton     |  | - IconButton     |  | - IconButton     |                  |
|  | - Announcer      |  | - Announcer      |  | - Announcer      |                  |
|  +------------------+  +------------------+  +------------------+                  |
|                                                                                    |
+-----------------------------------------------------------------------------------+

+------------------------------- Greeting Feature ---------------------------------+
|                                                                                    |
|  +------------------+                                                              |
|  |    Greeting      |                                                              |
|  |   (Component)    |                                                              |
|  |                  |                                                              |
|  | Uses:            |                                                              |
|  | - useTranslation |                                                              |
|  | - useRegion      | (for formatted date/number demo)                            |
|  +------------------+                                                              |
|                                                                                    |
+-----------------------------------------------------------------------------------+
```

## Component View - Shared Layer

```
+-----------------------------------------------------------------------------------+
|                              Shared Components                                     |
+-----------------------------------------------------------------------------------+

+------------------------------- UI Primitives ------------------------------------+
|                                                                                    |
|  +------------------+  +------------------+  +------------------+                  |
|  |     Button       |  |   IconButton     |  |      Link        |                  |
|  |   (Component)    |  |   (Component)    |  |   (Component)    |                  |
|  |                  |  |                  |  |                  |                  |
|  | Props:           |  | Props:           |  | Props:           |                  |
|  | - variant        |  | - icon (IconType)|  | - variant        |                  |
|  | - size           |  | - aria-label     |  | - external       |                  |
|  | - disabled       |  | - size           |  | - href           |                  |
|  +------------------+  +------------------+  +------------------+                  |
|                                                                                    |
+-----------------------------------------------------------------------------------+

+------------------------------- Accessibility ------------------------------------+
|                                                                                    |
|  +------------------+                                                              |
|  |   Announcer      |                                                              |
|  |   (Component)    |                                                              |
|  |                  |                                                              |
|  | - aria-live      |                                                              |
|  | - Visually hidden|                                                              |
|  | - SR announces   |                                                              |
|  +------------------+                                                              |
|                                                                                    |
+-----------------------------------------------------------------------------------+
```

## Dependency Flow (Clean Architecture)

```
[Navbar Feature] -----> [useTranslation] -----> [Translator Port]
       |                                               ^
       +-------------> [useTheme] --------> [ThemePort]|
       |                                               |
       +-------------> [useRegion] -------> [RegionPort]
       |
       +-------------> [IconButton] -----> [Design System Tokens]
       |
       +-------------> [Announcer]

Dependencies point INWARD:
- Features depend on Hooks
- Hooks depend on Ports (interfaces)
- Adapters implement Ports
- All visual properties from Design System tokens
```
