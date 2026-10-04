# Akram Sabry website — bilingual source bundle

## Files
- `index.html` — Arabic homepage (right-to-left).
- `index-en.html` — English homepage in the website root (left-to-right); the language selector links directly to this file.
- `en/index.html` — optional `/en/` route for hosts where the folder route is deployed.
- `styles.css` — shared responsive styles.
- `site.js` and `site-en.js` — localized menu, WhatsApp form, and needs-assistant interactions.
- Original image assets used by both versions. Training and testimonial graphics remain in Arabic and are identified as Arabic originals on the English page.

## Preview and deploy
Keep the folder structure and file names intact. Publish the bundle contents to the website root. The English page is available as `/index-en.html`; it does not depend on the `/en/` directory. For local preview, run `python3 -m http.server 8000` from this folder. No build step is required.

The contact form does not send data to a website server; it prepares a WhatsApp draft for the visitor to review and send.
