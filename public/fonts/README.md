# Font assets

These fonts are stored in the repository and served directly from `/fonts`.

| Family | Source snapshot | Files | License |
| --- | --- | --- | --- |
| Noto Sans KR Variable v39 | `@fontsource-variable/noto-sans-kr@5.2.10`, sourced from Google Fonts | 124 unicode-range WOFF2 shards | SIL Open Font License 1.1, `noto-sans-kr/OFL.txt` |
| Geist Mono Variable | `geist@1.7.2`, sourced from `vercel/geist-font` | `geist-mono/GeistMono-Variable.woff2` | SIL Open Font License 1.1, `geist-mono/OFL.txt` |

When updating a family, replace its WOFF2 files and license together, then update the matching `@font-face` declarations in `src/app/fonts.css`.
