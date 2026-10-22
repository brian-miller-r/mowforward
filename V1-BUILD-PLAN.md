# MowForward V1 Build and Submission Plan

## Goal

Submit a convincing, safe, working web-app demonstration for the 2026 Congressional App Challenge by Monday, October 26.  Treat the current site as a **prototype for the challenge**, not a public service that accepts real family information yet.

Official sources conflict: the registration page currently lists **9:00 PM ET**, while the official 2026 rulebook lists **12:00 PM EDT**.  Treat **noon EDT as the hard cutoff** and aim to submit by 9:00 AM ET.  Do not rely on the later time.

## What Already Works

The repository already contains a usable static prototype:

- clear landing page and two audiences;
- family profile and lawn-request flow;
- business ZIP-code filtering;
- claim and completion workflow;
- impact counters;
- responsive, polished visual design;
- demo data and a reset button.

That is more than enough functionality for a strong 1-3 minute demo.  Do not trade reliability for a rushed backend conversion before the entry is submitted.

## Success Definition for the Challenge V1

A judge can see this complete story in under two minutes:

1. A military family creates a request using only the information appropriate to display before a match.
2. A lawn company sees a nearby request by ZIP code, claims it, and then receives the private job details.
3. The company marks the job complete and the impact counter updates.
4. Henry explains that the current version is a browser-based prototype and names the security and verification work planned for a real pilot.

## P0 Changes - Do Before Recording

### 1. Remove apparent political endorsement

Replace the hero photo immediately.  Its visible campaign sign makes the app look politically affiliated, and the repeated congressional quotes distract from Henry's own story.  Use an original, neutral lawn image with no candidate, campaign, government seal, or identifiable house.  Remove the three quotes unless there is explicit permission and a direct, accurate source.

### 2. Repair the privacy model shown in the demo

Open requests should show only: ZIP, lawn size, preferred availability, and a broad age indicator such as "posted 2 days ago."  Do **not** show a family name, exact address, gate code, dog note, phone, or email until a business has claimed that specific request.

The present implementation displays `notes` for open requests, even though the form promises those notes are private.  Fix this before recording.

For the challenge demo, either:

- add a separate "private job details" panel that appears only after the claim, using invented demo information; or
- state that the business and family coordinate after a claim, and do not collect a street address in this prototype.

The second option is faster and safer.  Do not collect real addresses, gate codes, deployment documents, or DoD identifiers in a localStorage prototype.

### 3. Make prototype mode unmistakable

Add a small persistent banner on every screen: "Challenge prototype - sample data stays in this browser."  Rename "Live totals" to "Demo impact totals".  This makes the localStorage limitation honest and protects the family-facing language from implying that a live matching service exists.

### 4. Improve the state transitions judges will see

After a business claims a request, show:

- a confirmation message: "You claimed this request";
- a planned service date or "Coordinate schedule" state;
- a clear completed confirmation and updated impact total.

Disable or remove the family request form while there is an active request, rather than allowing the user to fill it and only warning after submit.

### 5. Capture a proper cover image

Create an original JPEG at **600 x 800 px (3:4)**.  It should be a clean mockup or screenshot of the landing page plus one simple message: "MowForward - neighbor-to-neighbor lawn care for military families."  It must not include the campaign sign, personal contact data, or an unlicensed photo.

## P1 Only If Time Remains

- Add simple client-side ZIP validation: exactly five digits and normalise whitespace.
- Add success and error messages instead of browser alerts.
- Add an accessibility pass: visible focus states, image alt text, and color contrast check.
- Deploy the static demo to a stable HTTPS URL (GitHub Pages, Netlify, or Cloudflare Pages) and add it to the form's optional project-link field.
- Add a short README section: how to run the demo, reset it, and test the main path.

## Do Not Add Before Submission

Do not add payment, maps/GPS tracking, recurring schedules, real military verification, texting, document uploads, reviews, or a public production sign-up.  Each adds privacy, reliability, or legal work but does not make the challenge demo stronger this weekend.

## Real Pilot V1 - After the Challenge

Before accepting real users, replace browser storage with a hosted database and authenticated roles.  A practical next stack is the same HTML/CSS/JavaScript front end plus Supabase Auth and Postgres, with row-level security:

| Data | Who may see it |
| --- | --- |
| Public impact totals | Everyone; aggregate only |
| Open request | Approved businesses in the matching ZIP; no family identity or property details |
| Claimed request | The matching business, the requesting family, and an admin |
| Contact/address details | Only after a claim, only to the assigned business and admin |

Add manual business approval, family verification through a trusted partner, cancellation and no-show handling, terms/privacy pages, and a real support contact before any Virginia Beach pilot.

## Four-Day Sprint

| When | Owner | Outcome |
| --- | --- | --- |
| Wed Oct 22 evening | Henry + Brian | Replace the hero image/quotes; add prototype banner; correct private-details logic; test the full happy path on a phone. |
| Thu Oct 23 | Henry | Write answers in his own voice, including the AI disclosure.  Create and export the 600 x 800 JPEG cover image. |
| Fri Oct 24 | Henry narrates, Brian records | Record 2-3 takes of the 1-3 minute demo.  Upload it publicly to YouTube or Vimeo and verify it plays in a logged-out window. |
| Sat Oct 25 | Both | Complete the portal form, add the public video URL and optional site URL, proofread every answer, and save the application as a draft. |
| Sun Oct 26 by 9 AM ET | Primary applicant | Final device check; submit; complete the exit questionnaire; save confirmation screenshots and the submission email. |

## Submission Form Checklist

Required content in the supplied portal capture:

- App name: MowForward
- Languages: JavaScript (and HTML/CSS can be named in the narrative or "Other" if the portal permits)
- Platform: Web
- Public HTTPS video URL
- Four written answers: description, inspiration, technical difficulties, and 2.0 improvements - each at most 400 words
- Required AI-use disclosure, at most 400 words
- What Henry learned, at most 400 words
- 600 x 800 JPEG cover image
- Coding location, completion date, project/mentor details if applicable, and final submit confirmation

The current `SUBMISSION-ANSWERS.md` is a useful starting point, but it needs a truthful AI-use answer.  Its noon deadline is the conservative choice because the official sources conflict.  Henry should rewrite the narrative responses in his own voice and describe exactly what he built, changed, tested, and understood.

## Suggested AI Disclosure Draft

Use this only if it is accurate, and revise it in Henry's own words:

> We used AI as a learning and brainstorming assistant while building MowForward. It helped us explore page layout ideas, explain HTML, CSS, and JavaScript concepts, and suggest ways to test the request flow. My team decided on the problem, designed the user flow, chose the features, reviewed and changed the code, tested the site, and made the final decisions. We can explain how the ZIP matching and request statuses work and what we would improve before using the app with real families.

## Demo Script Adjustment

Keep the live demo to roughly 1:45-2:15, leaving time for a natural introduction and close.  Emphasize the original insight: route-aware, ZIP-level matching lowers the cost of a business donating a mow.  Then earn trust by saying clearly: "This challenge version uses sample data in one browser. A real pilot would add verified accounts, private post-claim details, and notifications."
