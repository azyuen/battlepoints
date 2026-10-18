# BattlePoints — Morning Quest (v2)

A phone-first, installable, offline-friendly checklist for Ethan, with an original pixel-art explorer and a very short Battle Journey.

## Morning checklist

There are **three expandable quests, worth 1 BP each**: Morning Routine, Kitchen & Bathroom, and Ready for School. All steps in a quest must be ticked to earn its one regular point. Daily steps reset on the device's local date; timestamps, health reminders, BP, and history are retained.

A **sticky timer** replaces the clock, staying visible at the top while scrolling. Tap +/− to choose a duration from 1 to 120 minutes, then Play/Pause or Reset. It has no effect on scoring.

The **bonus shortcuts** under the quests are:
- **Piano +1 BP**: tap APPROVE, enter the adult PIN, and it immediately becomes claimable. Only one piano bonus can be offered per day.
- **Extra bonus**: tap ADD, enter the adult PIN, write a reason, choose 1 or 2 BP, and offer it. Ethan taps CLAIM to collect an offered bonus.

**Risk BP** is a no-PIN, two-step adult discretion measure on each quest. Press RISK BP to show an "at risk" warning, then optionally press **Forfeit this quest's 1 BP**, with a confirmation prompt. Arming risk alone **never removes points**. Clearing risk restores eligibility. A forfeited quest does not count toward the 3 BP required for an encounter, even if all steps are ticked. This is intentionally a manual decision, never a random or automatic penalty.

Vitamin/medication reminders remain optional, unscored checkboxes; medicine must not be incentivised by BP.

## Battle Journey (adult-PIN unlocked)

The former History tab is now **Battle Journey**. Stats, daily records, backups, bonus management, and delivery confirmations have moved into the adult control room.

The adventure is deliberately short and gentle, with little friendly pixel-art creatures rather than scary enemies.

- Every **day with all 3 regular BP** earns **one battle OR one mining encounter**, redeemable later. Two or more queued encounters can be resolved in a batch. Bonus BP cannot create encounters.
- **Starter sword + pickaxe** are a **one-time bundle for 3 BP**, equipped immediately. Encounter tokens remain pending until the starter kit is purchased.
- **Friendly battle** takes one tap; enemy difficulty increases every few wins. Winning earns 4 XP, and a friendly loss earns 2 XP.
- **Mining** takes one tap; it awards 2 XP and at least one random quartz, ruby, sapphire or emerald stone. An upgraded pickaxe can sometimes find two stones.
- **12 XP per level**. Stones improve sword power, mining equipment, armour or unlock skins. Higher equipment tiers require higher hero levels (and more stones).
- **Real-life rewards**: 5 BP for a Tokyo SHIFT car coupon of choice, or 15 BP for 10 extra minutes of technology time. These redemptions debit the wallet once and record a pending adult delivery confirmation.

**BP accounting:** The wallet shows earned BP less prior purchases and real-life redemptions; BP spent on equipment cannot also purchase real-world rewards. Daily quest scores remain visible after points are spent. If someone retrospectively changes a completed day, available BP can fall to zero, but prior transactions are retained in the audit history. Encounter tokens are derived from eligible full-score dates, and each date can be used only once.

## Privacy and limitations

All progress, PIN settings, receipts and game history are saved locally in this device/browser using `localStorage`. They are **not synced across devices**. There are no external accounts, analytics, libraries or network game services. Export/import JSON in the adult room for backups.

The PIN is checked in browser JavaScript against a salted SHA-256 hash. It is a family convenience gate, **not tamper-resistant security** against a technically curious child with developer tools or access to device storage. Reward fulfilment occurs in real life, outside this app.

## Hosting

Static HTML/CSS/JS with no build dependencies. GitHub Pages publishes `main` using `.github/workflows/pages.yml` once enabled in Settings → Pages → GitHub Actions.

Website: https://azyuen.github.io/battlepoints/

On iPhone: open in Safari → Share → Add to Home Screen.

To run locally: `python3 -m http.server 8080` and visit `http://localhost:8080`.

## Source files

- `index.html`: screen structure, quest tabs, timer and adult modal.
- `styles.css`: phone-first theme, responsive sticky timer and pixel game styling.
- `app.js`: daily checklist, bonus PIN, risk states, stats and persistence.
- `journey.js`: rewards ledger, encounters, XP, stones and equipment.
- `service-worker.js`: basic offline caching.
