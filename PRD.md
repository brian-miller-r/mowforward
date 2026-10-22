# MowForward — PRD & Business Case

**Working title:** MowForward
**One-liner:** A two-sided web platform where local lawn care businesses donate lawn service to military families while a spouse is deployed — matched by neighborhood, so a crew already on a nearby job can stop by and help.

**Authors:** Henry Miller (builder) + Brian Miller (co-pilot)
**Date:** October 17, 2026
**Why now:** Congressional App Challenge submission deadline — **October 26, 2026 at noon**. Nine days to build.

---

## 1. The Problem

When a service member deploys, the spouse left at home absorbs everything — bills, kids, the house, and the yard. Lawn care is one of those visible, recurring burdens:

- A neglected lawn draws HOA fines, neighbor complaints, and in some areas, real safety issues (pests, snakes, fire risk).
- Hiring a lawn service costs $100–$200+ per month — a real hit on a single-income military household budget.
- Spouses are often new to the area (PCS moves), so they don't know which local companies to trust.

Meanwhile, local lawn care crews are *already driving through these neighborhoods every week*. The supply of help and the demand for help are geographically overlapping but never meet — there's no system connecting them.

## 2. The Idea

MowForward is a two-sided marketplace for **donated lawn care**:

- **Side A — Military families:** A spouse of a deployed service member signs up, verifies eligibility, and posts a lawn-care request (address/ZIP, lawn size, how urgent).
- **Side B — Lawn care businesses:** A local company signs up, lists the ZIP codes it serves, and sees open requests **near its current jobs**. When a crew is already in the neighborhood, one extra stop costs them 20–30 minutes — and earns them community goodwill, visibility, and reviews.

The matching insight: donations happen *opportunistically*. Instead of asking a business to drive across town for charity, the app surfaces requests on routes they're already running. Low cost to give, high impact to receive.

## 3. How It Works (the core loop)

1. **Family signs up** → verifies as a military household (MVP: self-attestation + branch; later: partner with spouse orgs for verification) → posts a request: ZIP, lawn size, last mowed date, notes ("gate code 1234, dog in backyard").
2. **Business signs up** → lists service ZIPs and crew size → opens the **"Near My Jobs"** view → sees open requests filtered to ZIPs it already serves.
3. **Business claims a request** → family gets notified ("GreenStripe Lawn Co. will mow your lawn this Thursday") → status moves Open → Claimed.
4. **Job done** → business marks it complete (optional before/after photo) → status moves Claimed → Done → it lands on the **Impact Board**.
5. **Impact Board** (public) → running tally: lawns mowed, families helped, businesses participating, hours donated. This is the social proof that recruits the next business.

## 4. Users & Personas

**Military spouse (Side A)**
- "Kristin-type": spouse is deployed 6–9 months, works part-time, two kids, new to the neighborhood after a PCS move. Needs: a trustworthy, free, recurring lawn solution with zero awkwardness about asking.

**Lawn care business owner (Side B)**
- "Mike's Mowing": 2–3 crews, serves 8 ZIP codes, competes on price with 40 other local companies. Needs: differentiation, community reputation, and a way to give back that doesn't wreck his schedule.

**Admin (Henry + Brian, MVP only)**
- Reviews signups, resolves disputes, curates the Impact Board. (No admin UI in MVP — direct database access is fine.)

## 5. Goals & Success Metrics

**Challenge goal:** Submit a working demo + 1–3 minute video to the Congressional App Challenge by Oct 26, 2026 at noon.

**Product goals (if this becomes real):**
- 10 military families signed up in Virginia Beach (huge military population: NAS Oceana, JEB Little Creek–Fort Story — this is the perfect pilot market)
- 5 lawn care businesses signed up
- 25 donated mows completed in the first 90 days
- 50% of requests claimed within 7 days of posting

**Metrics the app tracks from day one:** requests posted, requests claimed, mows completed, active families, active businesses, average time-to-claim.

## 6. MVP Scope — This Week

### In scope
- Landing page explaining the mission (one page, clear call to action for each side)
- Family signup + "request a mow" form
- Business signup + "businesses near me" dashboard showing open requests filtered by ZIP
- Claim flow: business claims a request → status updates → family sees who's coming
- "Mark complete" + Impact Board (public counter of mows completed)
- Simple data storage (see §9)

### Out of scope (say it explicitly — judges like this)
- Payments of any kind (everything is donated; no money moves through the app)
- Real-time GPS crew tracking
- Automated military-status verification (MVP uses self-attestation + admin review)
- Recurring scheduling / subscriptions
- Mobile app (responsive web is enough)
- Reviews/ratings for businesses (great v2 feature — businesses earn badges: "10 mows donated")

### Deliberate simplifications
- ZIP-code matching instead of true geolocation (good enough for the demo, honest about it)
- One request per family at a time

## 7. User Stories

**Family side**
- As a military spouse, I can sign up in under 3 minutes so I can get help fast.
- As a military spouse, I can post a lawn request with my ZIP and lawn details so nearby businesses can find me.
- As a military spouse, I get notified when a business claims my request so I know who's coming and when.
- As a military spouse, I can see the Impact Board so I feel part of something bigger than just my lawn.

**Business side**
- As a lawn care owner, I can sign up and list my service ZIPs so the app only shows me relevant requests.
- As a lawn care owner, I can see open requests near my existing jobs so donating costs me almost nothing extra.
- As a lawn care owner, I can claim a request in one click so it fits into my crew's day.
- As a lawn care owner, I can mark a job done and have it counted publicly so my generosity is visible.

## 8. Product Requirements

### Pages
1. **Home / landing** — the story, the two CTAs ("I need lawn help" / "I own a lawn business"), live Impact Board stats.
2. **Family signup** — name, email, phone (optional), ZIP, branch of service, deployment status (self-attestation checkbox: "I am the spouse of an actively deployed service member").
3. **Request a mow** — address (or cross-streets for privacy), ZIP, lawn size (S/M/L), last mowed date, notes for the crew, preferred days.
4. **Family dashboard** — my request status (Open → Claimed → Done), who claimed it.
5. **Business signup** — company name, contact, email, phone, service ZIPs (multi-select), crew size.
6. **Business dashboard ("Near My Jobs")** — open requests filtered to my ZIPs, sorted by oldest first; one-click Claim.
7. **Impact Board** — total mows, families helped, businesses participating; recent completions feed.

### Data model (keep it tiny — 4 tables)
- `families`: id, name, email, phone, zip, branch, deployed_status, created_at
- `businesses`: id, company_name, contact_name, email, phone, service_zips[], created_at
- `requests`: id, family_id, zip, lawn_size, last_mowed, notes, status (open/claimed/done), business_id (nullable), created_at, completed_at
- `donations` (or just derive from requests where status=done): request_id, business_id, family_id, completed_at, photo_url (optional)

### Non-functional
- Must work on a phone browser (families will sign up from their phones).
- No real addresses displayed publicly — only ZIP-level data is ever public; exact address visible only to the business that claimed the request.
- Keep PII minimal: no SSNs, no DoD IDs, no payment info — ever.

## 9. Suggested Build Approach

Keep the stack boring and shippable in 9 days. Two options:

- **Option A (recommended): plain HTML/CSS/JavaScript + a free backend** (e.g., Firebase or Supabase free tier). Fastest path to a live, demoable site; auth and database included.
- **Option B: Python (Flask) + SQLite.** Good if Henry wants to show "real" backend code; slightly more setup.

Either is fine for the Challenge — judges care about the idea, the execution, and the video, not the stack. Pick one Saturday morning and don't look back.

## 10. Business Case

### Why this wins as a business/venture (and as a Challenge entry)

**The problem is real and specific.** ~1.3M active-duty service members; deployments routinely leave spouses solo-managing a household. Lawn care is a visible, recurring, outsourced-able task — the ideal unit of donated service. Judges love problems that are concrete, not abstract.

**The two-sided incentive design actually works:**
- *Families* get free lawn care with dignity — no begging on social media, no awkwardness. A structured request feels like a program, not charity.
- *Businesses* get what small service companies desperately need: differentiation. A "MowForward Partner" badge, a public Impact Board showing their donations, and genuine community goodwill are worth more than a Facebook ad. The cost of one donated mow (~30 min of crew time, already in the neighborhood) is tiny against the marketing value.

**The "already in the neighborhood" mechanic is the differentiator.** Generic volunteer platforms ask businesses to go out of their way. MowForward piggybacks on routes that already exist — it's the lowest-friction form of corporate generosity ever designed for this industry.

**Pilot market is perfect:** Virginia Beach has one of the densest military populations in the country (NAS Oceana, JEB Little Creek–Fort Story, Dam Neck). Supply (lawn companies) and demand (military families) are both concentrated here. If it works in Virginia Beach, the playbook replicates to San Diego, Norfolk, Fayetteville, Killeen…

### Sustainability (post-MVP thinking — good for the video's "future" slide)
- Free for families, free for businesses — forever. That's the point.
- Optional later revenue to keep the lights on: sponsored "featured partner" spots for businesses, grants (military-family foundations), or a nonprofit 501(c)(3) structure funded by donations. None of this is needed for the MVP or the Challenge.

### Risks & honest answers
- **Verification fraud:** someone could falsely claim military-spouse status. MVP answer: self-attestation + admin review; real answer: partner with existing military spouse organizations for verification.
- **Business flakiness:** a business claims a request and never shows. MVP answer: status timeouts (auto-reopen after 7 days) + admin oversight; later: reliability badges.
- **Liability:** crews on someone's property. MVP answer: terms of service + both parties opt in; real answer: talk to a lawyer before scaling.
- **Cold start:** no families → no businesses → no families. MVP answer: seed both sides manually in Virginia Beach — spouse Facebook groups + direct outreach to 10 lawn companies.

## 11. Why This Can Win the Challenge

- **Solves a real problem** for a sympathetic, underserved community (military spouses).
- **Original mechanic** — opportunistic neighborhood matching, not another generic volunteer board.
- **Working demo is achievable** in the time available (CRUD app, no exotic tech).
- **Great video story:** "while our service members serve overseas, we take care of the home front — one lawn at a time." Judges remember stories.
- **Clear future vision** without scope creep — the PRD shows you thought about scale, verification, and sustainability.

## 12. Build Plan: Oct 17 → Oct 26

| Day | Focus |
|---|---|
| Sat 10/17 | PRD done (this file) → pick stack → paper wireframes of the 7 pages |
| Sun 10/18 | Landing page + family signup + request-a-mow form |
| Mon 10/19 | Business signup + "Near My Jobs" dashboard (ZIP filtering) |
| Tue 10/20 | Claim flow + status transitions (open → claimed → done) |
| Wed 10/21 | Impact Board + polish + mobile check |
| Thu 10/22 | Test with family/friends; fix bugs |
| Fri 10/23 | Record the 1–3 minute demo video |
| Sat–Sun 10/24–25 | Register + submit; buffer for surprises |
| Mon 10/26 | **Hard deadline: noon.** Submit early — don't trust hotel wifi. |

## 13. Congressional App Challenge — Submission Checklist

Facts verified from the official Challenge info (Oct 2026):
- **Who:** Middle and high school students — Henry (12, middle school) is eligible. Individuals or teams up to 4; at least half the team must live in or attend school in the district.
- **What:** An app on any platform, in any language, on any topic — a web app like MowForward qualifies. Must have been created after October 30, 2025.
- **Where:** Compete in the district where you live or go to school. → **Verify at congressionalappchallenge.us that Virginia's 2nd district (Virginia Beach) is participating this year and confirm the exact local deadline.**
- **When:** Submissions close **October 26, 2026 at noon** (confirm the district's exact cutoff — some districts list noon, some 5 PM).
- **How:** Register at congressionalappchallenge.us → submit the app + a **1–3 minute video** walking through it + answers to questions about the idea and build process. (A finished, polished app is not strictly required — the video and proposal carry weight — but a working demo is much stronger.)
- **Prizes:** Winning app featured on the House website, displayed in the U.S. Capitol for one year, invitation to the #HouseOfCode reception, copyright fee waiver.

**Don't forget:** Henry participated last year, so check last year's registration email for the account/login to reuse — and note what the judges' feedback was, if any.

---

*Next step: pick the stack Saturday morning, sketch the 7 pages on paper, and start building. The idea is solid — now go make it real.*
