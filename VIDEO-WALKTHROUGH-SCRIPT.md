# Mission Mow — Video Walkthrough Script

Target length: **2:00–2:30** (rules require 1–3 minutes; verify the final cut is ≤ 3:00)

Henry narrates; Brian runs the browser / records. Official judging beats are
covered in order: name + app name → purpose → who it's for → tools/languages →
how it works → difficulty/solution → takeaway.

---

## Pre-recording checklist (5 minutes)

1. From this folder: `python3 -m http.server 8000` → open `http://localhost:8000`
2. Scroll to the page footer → click **"Reset site data"** so the video starts
   from a clean, known state.
3. Turn on Do Not Disturb. Full-screen the browser, zoom in a notch
   (Cmd +) so text is readable on camera.
4. QuickTime Player → File → New Screen Recording (Brian's Mac) or OBS.
   Do one dry run all the way through before recording for real.

## Shot 0 — Opening (0:00–0:15) · landing page (index.html)

> "Hi, I'm Henry Miller, a middle schooler from Virginia Beach, Virginia —
> that's Virginia's 2nd District. My app is called **Mission Mow**. Its purpose
> is to connect local lawn care businesses with military families, so a crew
> already working in a neighborhood can stop by and donate a mow while a
> spouse is deployed."

(Scroll past "While they serve, we mow." and the "How it works" 3 steps as you talk.)

## Shot 1 — Who it's for + inspiration (0:15–0:35) · "Why start in Virginia's 2nd District"

> "Virginia Beach has one of the largest military communities in the country —
> Oceana, Little Creek, and Dam Neck are all right here. When a spouse deploys
> for months, the lawn doesn't wait — and neither do the dozens of lawn crews
> already driving these streets every week. Mission Mow simply introduces them."

## Shot 2 — Family flow (0:35–1:05) · family.html ("For military families")

- Scroll through the "Create profile" form (name / email / phone) and the
  request form: **ZIP** (`rf-zip`, e.g. 23456), **preferred days**
  (`rf-days`), **gate code / dog notes** — then click **"Post my request."**
- Show the request appearing with status **Open**.

> "On the family side, a military spouse signs up, shares their ZIP and lawn
> details, and posts a request — no awkward asking. The request starts as
> Open, and you can watch its status change."

## Shot 3 — Business flow (1:05–1:40) · business.html ("For lawn care businesses")

- Fill "Join Mission Mow": company (e.g. GreenStripe Lawn Co.), contact,
  email, phone, **service ZIPs** (e.g. 23456, 23452, 23464) → **Join Mission Mow.**
- Scroll to **"Near my jobs"** — "Open requests in your service area — claim one
  with a single click." Click **"Claim this mow"** on the new request.
- Click **"Mark complete."**

> "On the business side, a lawn company joins with the ZIP codes it already
> serves, sees open requests nearby, and claims one in a single click. The
> crew stops by on their regular route and marks it complete."

## Shot 4 — Impact Board (1:40–1:55) · back on index.html

- Scroll to the **Impact Board** — lawns mowed, families helped, businesses
  giving back tick up from the completion.

> "Every completed mow lands on the public Impact Board, so the whole
> community can see the generosity."

## Shot 5 — How it's built + difficulty + 2.0 (1:55–2:15)

> "I built Mission Mow with plain **HTML, CSS, and JavaScript** — no frameworks,
> no build step. All the data is stored in the browser's **localStorage**, so
> the site works with zero backend. The hardest part was [Henry's actual
> difficulty — e.g. keeping the family and business views in sync on status
> changes]; I solved it by [his actual solution]. If I built a 2.0, I'd add
> a real backend, military-status verification, and text notifications."

## Shot 6 — Close (2:15–2:25) · hero section

> "The biggest thing I learned is [Henry's takeaway]. Thanks!"

---

## Submission rules checklist (Congressional App Challenge 2026)

- [ ] Video is **1–3 minutes** (final cut ≤ 3:00 — do not go over)
- [ ] Video uploaded to **YouTube or Vimeo, set to PUBLIC** (judges cannot view
      private or unlisted videos)
- [ ] Video covers: name(s) + app name · purpose · intended audience ·
      tools/languages · live walkthrough of how it works
- [ ] **Register at congressionalappchallenge.us** before submitting (all team
      members must be on the registration form)
- [ ] Written answers at submission: app title · one-sentence purpose ·
      inspiration · technical difficulty + solution · what you learned ·
      what you'd change in a 2.0
- [ ] Deadline: **Monday, Oct 26, 2026 at 12:00 PM ET** — submit the morning of,
      not at 11:59. (Some offices post it in local time; the national cutoff is
      the same moment.)
- [ ] App must have been created after Oct 30, 2025 and be the entrants'
      original work

Rules verified 2026-10-18 against house.gov district pages (Hudson/NC-9,
Bonamici/OR-1, Fitzgerald/WI-5, Wagner/MO-2, Schneider/IL-10, Fry/SC-7) and the
CAC timeline summary. VA-02 has run the challenge in prior years (2022 under
Rep. Luria, 2024 under Rep. Kiggans); confirm 2026 participation on
congressionalappchallenge.us at registration time.
