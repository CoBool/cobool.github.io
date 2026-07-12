# KaTeX static assets

This directory contains the browser stylesheet and fonts from KaTeX `0.16.47`.

- Source: `katex` npm package, `dist/katex.min.css` and `dist/fonts`
- License: MIT; see `LICENSE`
- Runtime rendering: `rehype-katex` remains responsible for producing static HTML and MathML during the build

When upgrading the KaTeX version used by `rehype-katex`, replace the stylesheet, fonts, and license together. Do not edit the upstream stylesheet independently from its fonts.
