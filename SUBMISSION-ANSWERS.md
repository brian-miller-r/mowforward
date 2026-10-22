# MowForward — Written Submission Answers (draft)

The submission form at congressionalappchallenge.us asks for written answers
alongside the app and the demo video. Draft answers below — all factual ones
are grounded in the PRD. **Henry: do not copy these word-for-word.**
Judges read hundreds of entries and they want *your* voice. Rewrite each one
in your own words before submitting — the facts stay, the sentences change.

Deadline: **Monday, Oct 26, 2026, 12:00 PM ET** — register at
congressionalappchallenge.us *before* submitting, submit the morning of,
not at 11:59. VA-02 confirmed participating (Rep. Kiggans's House page,
2026-10-18). Video must be PUBLIC on YouTube/Vimeo. Exit questionnaire
after submitting — one per teammate.

---

## 1. App name

MowForward

## 2. Programming language(s)

HTML, CSS, and JavaScript. All the data is stored in the browser using
localStorage, so the demo runs with no backend and no server.

## 3. One-sentence purpose

MowForward is a website where local lawn care businesses donate lawn
service to military families while a spouse is deployed — matched by ZIP
code to crews already working in that neighborhood, so one extra stop
costs them about 20–30 minutes.

## 4. What inspired you to build this app?

I live in Virginia Beach, Virginia (Virginia's 2nd District), which has one
of the largest military communities in the country — NAS Oceana, JEB Little
Creek–Fort Story, and Dam Neck are all here. When a service member deploys,
the spouse at home has to handle everything — bills, kids, the house, and
the yard. A neglected lawn draws HOA fines and neighbor complaints, and hiring
a lawn service costs $100–$200+ a month on a single-income household.

But every week, dozens of lawn crews are *already driving through these same
neighborhoods*. The help and the need are in the same streets — they just
never meet. I also entered the Congressional App Challenge last year, so I
wanted to build something that helps a community I actually live in.

## 5. What was the hardest technical problem, and how did you solve it?

> ⚠️ HENRY FILLS THIS IN — two honest sentences beat a polished paragraph.
> Think about what actually got you stuck while building this week. Examples
> of real answers: "Keeping the family and business views in sync when a
> request went Open → Claimed → Done, because both sides read the same
> localStorage data"; "Getting the ZIP-code filter right so businesses only
> see requests in the ZIPs they serve"; "Making the pages work on a phone
> browser." Say what broke, then what you changed to fix it.

## 6. What did you learn from building this?

> ⚠️ HENRY FILLS THIS IN — your own words. Prompts: What surprised you about
> the two-sided design (families need dignity, businesses need a reason to
> donate)? What would you tell another student starting this challenge?
> Keep it to two or three sentences.

## 7. What would you change or add in a 2.0? What still needs work?

Honest list — judges respect knowing the limits of an MVP:

- **A real backend** (e.g., Firebase or Supabase) instead of localStorage, so
  families and businesses share live data instead of demo data on one browser.
- **Real military-status verification** — MVP uses self-attestation; the real
  version would partner with existing military spouse organizations so no one
  can falsely claim the benefit.
- **Text notifications** — tell the family who's coming and when, instead of
  requiring them to check the site.
- **Reliability handling** — if a business claims a request and never shows,
  auto-reopen it after 7 days; add reliability badges for businesses that
  follow through.
- **Recurring scheduling** — deployments last 6–9 months; one donated mow is
  great, a standing commitment is better.
- None of the above moves money: MowForward is donations only, no payments
  ever pass through the app.

---

## Before you submit

- [ ] Henry rewrites answers 5 and 6 (and 3, 4, 7) in his own words
- [ ] Register both teammates at congressionalappchallenge.us
- [ ] Record the demo video using DEMO-VIDEO-SCRIPT.md (Fri 10/23 at latest)
- [ ] Upload video to YouTube/Vimeo, set to PUBLIC, verify the link plays
      in a logged-out browser
- [ ] Submit the morning of Monday 10/26 — app + video + these answers
- [ ] Exit questionnaire after submitting (one per teammate)
