# Akram Sabry website — bilingual static site

## Main pages
- `index.html` — Arabic homepage (right-to-left).
- `index-en.html` — English homepage (left-to-right).
- `courses/index.html` and `en/courses/index.html` — Arabic and English program directories.
- `courses.json` — bilingual course-page content source.
- `generate_courses.py` — generates crawlable static HTML pages from `courses.json`.
- `styles.css`, `site.js`, and `site-en.js` — shared presentation and localized interactions.

## Training program pages
Seven standalone program pages are generated in both Arabic (`/courses/<slug>.html`) and English (`/en/courses/<slug>.html`). The homepage links to every program; the language switcher connects each translation pair. Page content is present in static HTML so it does not depend on JavaScript for indexing.

To regenerate the program directory and detail pages after editing `courses.json`, run:

```sh
python3 generate_courses.py
```

Then preview locally with:

```sh
python3 -m http.server 8000
```

## SEO and contact
`robots.txt` permits crawling and points to `sitemap.xml`; the sitemap lists both homepages, both program directories and every course page. `llms.txt` provides an additional index of the bilingual program pages; it is supplementary and does not guarantee indexing or visibility. Confirm course availability, final content, dates, fees, delivery format and any certificate details before advertising them.

The contact form does not send data to a website server; it prepares a WhatsApp draft for the visitor to review and send.
