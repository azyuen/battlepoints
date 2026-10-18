# BattlePoints — Morning Quest

A simple, installable, phone-friendly morning checklist for Ethan. Built without dependencies or accounts.

## How it works

- **3 regular Battle Points per day** — one for completing each expanded quest: Morning Routine, Kitchen & Bathroom, Ready for School.
- **Piano is never required for regular points.** An adult can choose to make one piano bonus (1 BP) available that day, or add other reason-based bonus rewards (+1 or +2 BP).
- **Adult PIN** — set a 4–8 digit PIN the first time you open Adult. The adult enters a reason for every bonus. Ethan taps **CLAIM** when it appears on his home screen.
- **Simple visual countdown timer** — choose the minutes, start/pause/reset at any time. Timers never change points.
- **Live clock** and an original pixel-art adventurer who gains equipment for quest progress.
- **Daily history** — completion of individual steps, timestamps, regular/bonus points, and a seven-day chart. Daily quests reset by local device date; history stays.
- **Export/import backup** in the adult panel.

## Hosting

Static files can be served directly; open with a local web server for service-worker support.

A GitHub Pages deployment workflow is included at `.github/workflows/pages.yml`. In repository **Settings → Pages**, set **Build and deployment → Source → GitHub Actions**, if not already enabled. Deployments then run on pushes to `main`.

Expected URL after Pages is active: `https://azyuen.github.io/battlepoints/`

On iPhone, open the website in Safari and select **Share → Add to Home Screen**.

## Data and privacy

**Important:** Daily history and the adult PIN are stored in **localStorage on that device/browser**, not in GitHub and not in a cloud database. No analytics, external libraries, or user accounts. Progress **does not sync between devices** and can disappear if browser site data is cleared. Export a backup periodically. Importing a backup replaces existing local records and the PIN.

The adult PIN is stored as a salted SHA-256 hash (not plain text); however, browser-only PIN checks are a *convenience barrier*, not secure authentication against someone who can inspect or manipulate their browser. If you later need tamper-resistant parental approval or multi-device syncing, add a backend with authenticated adult accounts.

## Development

This project intentionally uses plain HTML, CSS and JavaScript so it's easy to maintain. No build step. Run a local server from this directory:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`. The workflow checks JavaScript syntax and the web manifest before deploying.

## Checklist categories

**Morning Routine (1 BP):** make bed, turn off purifier, wash face, sunscreen, uniform, put away bed clothes.

**Kitchen & Bathroom (1 BP):** make egg, make milk, kitchen complete, brush teeth and clean nose, toilet and wash hands, bathroom complete.

**Ready for School (1 BP):** lunchbox in bag, water bottle, zip bag, check bag checklist.

There is a health reminder separate from scoring. Vitamins or medications are **not** incentivised by game points; an adult decides whether they are needed.

© Personal family project.
