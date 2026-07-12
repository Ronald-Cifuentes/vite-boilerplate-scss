# CodePen OJLMgYY: Fork This Nav

**Author:** Ryan Mulligan (hexagoncircle)

**Original URL:** https://codepen.io/hexagoncircle/pen/OJLMgYY

**Recovery Source:** web.archive.org snapshot 20260211190049 (codepen.io returns Cloudflare 403 to
non-browser user agents)

**License:** CodePen terms allow forking for educational/derivative work

## Contents

- `index.html` - Full HTML panel (checkbox hack toggle, nav structure, submenu nesting)
- `styles.scss` - Full SCSS panel (CSS-only animation, no JavaScript)

## Fonts

| Font            | Usage          | License                          |
| --------------- | -------------- | -------------------------------- |
| Rubik Mono One  | Top-level menu | SIL Open Font License via Google |
| Roboto Mono 400 | Body/submenu   | Apache 2.0 (Roboto) via Google   |
| Roboto Mono 700 | Bold weight    | Apache 2.0 (Roboto) via Google   |

## Color Palette

| CSS Variable        | Hex     | Usage                         |
| ------------------- | ------- | ----------------------------- |
| `--color-primary`   | #18181A | Band overlay background       |
| `--color-secondary` | #75757C | Submenu text, hover text      |
| `--color-dark`      | #364C62 | Default link text, page body  |
| `--color-light`     | #F5F5F5 | Hover band, light backgrounds |

## Timing Tokens

| Token  | Value                               | Usage                 |
| ------ | ----------------------------------- | --------------------- |
| `--td` | 150ms                               | Base transition delay |
| `--te` | cubic-bezier(0.215, 0.61, 0.355, 1) | Easing function       |

## Key Visual Features

1. **Hamburger 2-bar to X**: Two horizontal bars (`::before`/`::after`) rotate 45/-45 deg with 1turn
   spin
2. **Band-slide overlay**: Two half-height `::before`/`::after` bands slide in from left
3. **Staggered item entrance**: `nth-child` delays (25% of `--td * 2` per item)
4. **Sibling pull effect**: Hovered item transforms siblings by `--pull: 30%` up/down
5. **Hover dim**: Non-hovered items dim to `opacity: 0.25`
6. **Light-band slide**: `::before`/`::after` on links slide in on hover
7. **Blink caret**: CSS `@keyframes blink` animation on hover

## Author's Caveat

> "The code within has not been browser tested. This was made to experience a quick thrill with the
> power of CSS."

Our implementation must achieve production-grade accessibility and cross-browser reliability while
replicating the visual and motion fidelity.
