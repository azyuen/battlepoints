# BattlePoints — Morning Quest (v2.2)

A phone-first, installable, offline-friendly checklist for Ethan, with an original pixel-art explorer and a very short Battle Journey.

## Morning checklist

There are **three expandable quests, worth 1 BP each**: Morning Routine, Kitchen & Bathroom, and Ready for School. All steps in a quest must be ticked to earn its one regular point. Daily steps reset on the device's local date; timestamps, health reminders, BP, and history are retained.

A **sticky timer** replaces the clock, staying visible at the top while scrolling. Tap +/− to choose a duration from 1 to 120 minutes, then Play/Pause or Reset. It has no effect on scoring.

The **bonus shortcuts** under the quests are:
- **Piano +1 BP**: tap APPROVE, enter the adult PIN, and it immediately becomes claimable. Only one piano bonus can be offered per day.
- **Extra bonus**: tap ADD, enter the adult PIN, write a reason, choose 1 or 2 BP, and offer it. Ethan taps CLAIM to collect an offered bonus.

**Risk BP** is a no-PIN, two-step adult discretion measure on each quest. Press RISK BP to show an "at risk" warning, then optionally press **Forfeit this quest's 1 BP**, with a confirmation prompt. Arming and clearing a risk require **no confirmation**. Arming risk alone **never removes points**. Clearing risk restores eligibility. A forfeited quest does not count toward the 3 BP required for an encounter, even if all steps are ticked. This is intentionally a manual decision, never a random or automatic penalty.

Vitamin/medication reminders remain optional, unscored checkboxes; medicine must not be incentivised by BP.

**End the Morning:** a permanent, one-tap cutoff at the very bottom of Daily Quests. The app saves `endedAt`, `finalRegularBP` and `finalBonusBP` for the date, turns the daily screen grey, and disables all checklist interactions (tasks, health reminders, risk changes, new bonus offers and bonus claiming). There is intentionally no cheerful completion animation. The next local calendar day has a fresh checklist. The adult history shows the closed time; previous records are retained.

## Battle Journey (adult-PIN unlocked)

The former History tab is now **Battle Journey**. Stats, daily records, backups, bonus management, and delivery confirmations have moved into the adult control room.

The adventure is deliberately short and gentle, with little friendly pixel-art creatures rather than scary enemies.

- Every **day with all 3 regular BP**, after tapping **End the Morning**, earns **one battle OR one mining encounter**, redeemable later. Old historical days with 3/3 points remain eligible even if they predate the closure feature. Two or more queued encounters can be resolved in a batch. Bonus BP cannot create encounters.
- Opening or cancelling an encounter pop-up does **not** consume the encounter. The one action button resolves and records it once. Batches follow the same single-action/result/Next flow.
- **Starter sword + pickaxe** are a **one-time bundle for 3 BP**, equipped immediately. Encounter tokens remain pending until the starter kit is purchased.
- **Friendly battle** opens a brief pop-up with a larger creature and explorer sprite. Tap **Attack**, see the result, then **Next** to return to Journey. Enemy difficulty increases every few wins. Winning earns 4 XP, and a friendly loss earns 2 XP.
- **Mining** opens a pop-up with a larger mineral-rock sprite. Tap **Dig**, see the gemstone result, then **Next** to return to Journey. It awards 2 XP and at least one random quartz, ruby, sapphire or emerald stone. An upgraded pickaxe can sometimes find two stones.
- **12 XP per level**. Stones improve sword power, mining equipment, armour or unlock skins. Higher equipment tiers require higher hero levels (and more stones).
- **Real-life rewards**: 5 BP for a Tokyo SHIFT car coupon of choice, or 15 BP for 10 extra minutes of technology time. These redemptions debit the wallet once and record a pending adult delivery confirmation.

**BP accounting:** The wallet shows earned BP less prior purchases and real-life redemptions; BP spent on equipment cannot also purchase real-world rewards. Daily quest scores remain visible after points are spent. If someone retrospectively changes a completed day, available BP can fall to zero, but prior transactions are retained in the audit history. Encounter tokens are derived from eligible full-score dates, and each date can be used only once.

## Developer Mode — isolated local profile

Dev Mode is a device-specific, adult-PIN-unlocked testing profile. It does not clone or modify the LIVE morning records.

**First-time activation on your phone:** open **Adult**, enter the existing adult PIN, then press **UNLOCK DEV ON THIS DEVICE**. From then on, a clearly labelled **ENTER DEV PROFILE / EXIT DEV** toggle is visible below the header whenever the web app is opened on that device. You can relock device access from Adult without deleting the test save.

The DEV profile uses its own browser storage key (`battlepoints-dev-sandbox-v1`), with independent simulated dates, daily checklists, BP ledger, spent rewards, gems, level, equipment and encounters. LIVE still uses `battlepoints-morning-v1` unchanged. A conspicuous orange TEST banner displays while DEV is active.

**Test controls:**
- **◀ DAY / DAY ▶** navigate simulated calendar dates, without changing your phone clock. Date and test save persist after closing the app.
- **ALL TASKS** checks the list but leaves the day open for testing the ordinary End Morning button.
- **+3 BP DAY** completes all tasks and closes the simulated morning, awarding its 3 regular BP and unlocking a Journey encounter.
- **+1 BP / +5 BP** add testing-only spendable BP, *not* regular quest BP, so they do not create encounters by themselves.
- **+12 XP** simulates one hero level. **+5 GEMS** gives stones for testing upgrades.
- **RESET THIS DAY** clears the test checklist and points for the displayed date but preserves any encounter already consumed for that date. **RESET DEV SAVE** starts the entire test profile (equipment, spending and dates) over from scratch. Both reset actions are confirmed.

Journey and Adult screens in an active DEV profile don't require re-entering the PIN. All interactions are confined to its test save.

For safety, the device unlock is a convenience gate held in localStorage. It is **not secure authentication** against someone with developer tools. No real-world rewards are automatically delivered from the app, and DEV reward claims should never be honoured in real life.

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
