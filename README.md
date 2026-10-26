# Mission Mow

A prototype that connects military families who need lawn help with local
lawn-care businesses that can donate an extra stop on an existing route.

## Run it

No build step, no dependencies. From this folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in a browser.

(You can also double-click `index.html`, but a tiny local server is more reliable
for testing.)

## Site

The site is available at `http://127.0.0.1:8000/`. It uses an original,
public-service editorial design inspired by the visual structure of America.gov.

## What's inside

- `index.html` — landing page: hero, how it works, coverage map, and Impact Board
- `family.html` — military-family signup + "request a mow" form + request status
- `business.html` — lawn-business signup + "Near My Jobs" dashboard (claim requests, mark complete)
- `styles.css` — all styling
- `app.js` — data layer. Everything is stored in the browser's `localStorage`,
  so the site works with zero backend. Do not enter real addresses, gate codes,
  deployment information, or other sensitive data.
- `images/hero-yard.jpg` — hero image

## Site data

The first time the site loads it seeds a few families, businesses, and
requests (some open, some completed) so every screen has something to show.
The data remains in the browser and can be cleared through the browser's site
data controls.

## Possible future work

- Real backend (Firebase/Supabase free tier) instead of localStorage
- Military-status verification via spouse organizations
- Business reliability badges + reviews
- Recurring scheduling, SMS/email notifications
