# Mission Mow — v1 Site

A two-sided lawn-care donation platform, built for the
2026 Congressional App Challenge (Virginia's 2nd District).

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

- `index.html` — landing page: hero, how it works, quotes, live Impact Board
- `family.html` — military-family signup + "request a mow" form + request status
- `business.html` — lawn-business signup + "Near My Jobs" dashboard (claim requests, mark complete)
- `styles.css` — all styling
- `app.js` — data layer. Everything is stored in the browser's `localStorage`,
  so the site works with zero backend. Do not enter real addresses, gate codes,
  deployment information, or other sensitive data.
- `images/hero-yard.jpg` — hero image
- `PRD.md` — the product requirements + business case the site is built from

## Site data

The first time the site loads it seeds a few families, businesses, and
requests (some open, some completed) so every screen has something to show.
The footer of each page has a **"Reset site data"** link to start over.

Try this flow for the video walkthrough:

1. As a business: sign up on `business.html`, see the open requests near your ZIPs,
   claim one.
2. Mark it complete — watch the Impact Board on `index.html` tick up.
3. As a family: sign up on `family.html`, post a request, watch its status change
   from Open → Claimed → Done.

## What's next (from the PRD)

- Real backend (Firebase/Supabase free tier) instead of localStorage
- Military-status verification via spouse organizations
- Business reliability badges + reviews
- Recurring scheduling, SMS/email notifications
