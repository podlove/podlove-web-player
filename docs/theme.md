---
navigation: 4
---

# Theming

<color-picker :config="$withBase('fixtures/example.json')" />

## Color Calculation

The player requires at least one main color. If not provided the default color will be used.
Without setting a highlight color the essential control elements are colored black or white depending on a calculated [WCGA contrast ratio](https://www.w3.org/TR/WCAG20/#contrast-ratiodef).
With a highlight color in place these control elements will be colored accordingly.
