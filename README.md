# Fethiye Villa Care Website

Static, mobile-first website for Fethiye Villa Care. The site has Turkish, English and Russian URL paths and separate, pre-rendered service pages.

## Preview locally

After changing page copy in `assets/app.js`, run `node build.mjs` to render each route into its own HTML file. Then serve this folder with any static file server that supports `index.html` in nested directories. The site does not require external build dependencies. Keep the same folder structure when uploading.

## Before publishing

- Production domain: `https://fethiyevillacare.com`.
- Confirm the WhatsApp/telephone number, the three air-conditioning prices and what those prices include.
- Confirm the actual pool and garden service scope, chemical/material arrangements and service area.
- Confirm any travel charges, opening hours and photo/logo usage rights.
- Review the English and Russian copy with a fluent speaker.
- Canonical URLs and sitemap entries use the production domain.

## Project files

- `index.html`: shared document shell.
- `assets/app.js`: page content, route mapping, language switching and WhatsApp messages.
- `build.mjs`: pre-renders each localized route and service page for search engines.
- `assets/style.css`: responsive design system and layout.
- `tr/`, `en/`, `ru/`: static URL folders for each translated page.
- `sitemap.xml` and `robots.txt`: production crawler and sitemap settings.

The hero illustration is built with CSS. It is a design illustration, not a photograph of the business or a customer's property.
