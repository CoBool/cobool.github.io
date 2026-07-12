# KaTeX static assets

This directory contains the browser stylesheet and fonts from KaTeX `0.16.47`.

- Source: `katex` npm package, `dist/katex.min.css` and `dist/fonts`
- Browser format: WOFF2 only; the WOFF and TTF fallback URLs were removed from the upstream stylesheet
- Font set: 19 KaTeX-rendered variants; the unused `KaTeX_Caligraphic-Bold` face was removed
- License: MIT; see `LICENSE`
- Runtime rendering: `rehype-katex` remains responsible for producing static HTML and MathML during the build

When upgrading the KaTeX version used by `rehype-katex`, replace the stylesheet, WOFF2 fonts, and license together, remove the legacy WOFF and TTF sources from each `@font-face` rule again, and re-audit whether KaTeX can emit every included font face.
