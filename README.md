# BattlePoints — Morning Quest (v2.3)

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

The former History tab is **Battle Journey**. Stats, daily records, backups, bonuses and real-world reward delivery confirmations are in the Adult room.

**Access and banking:** each day closed with **3 regular BP** earns one permanent encounter token for **either** battle or mining. Tokens accumulate over days; there is no requirement to play on the day earned. A child can return for multiple encounters on a day when the adult has unlocked Journey. The LIVE tab requires the adult PIN every time Journey is re-entered after leaving it; active DEV testing skips repeat PIN checks. Prior v2 saves' eligible 3/3 days are preserved.

- **Battle:** preview an original friendly pixel-art creature, its Level, HP, Attack, the hero's Attack and Defence, and a numerical win probability. Choose **Attack** or **Flee**. Flee closes the pop-up without consuming BP *or* the encounter. Attacking spends **one encounter but zero BP**, with either 4 XP on a win or 1 XP on a miss.
- **Mining:** preview a pixel-art rock, its Hardness, the hero's Mining Power and a chance of finding a gem. Choose **Dig** or **Leave**. Leaving keeps the encounter; digging consumes one encounter, costing **no BP**. A find awards a random quartz/ruby/sapphire/emerald stone plus 2 XP; an ordinary-rock outcome awards **no gem** and 1 XP. Better pickaxes increase the chance.
- **Batch play:** use Battle several or Mine several with banked encounters. Each individual opponent still gets its own preview and choice, result and Next button. Closing/fleeing mid-batch preserves untouched encounters.
- **Two square character kits:** Battle Kit and Mining Kit show the actual equipped skin, armour, weapon or pickaxe on the character, with live stats. The same appearance is used in the animated pop-up.
- **Equipment shop:** a one-time 3 BP starter bundle; three additional sword tiers, three pickaxes and three armour sets at **4/8/12 BP**, with progressive level requirements; cosmetic skins at **2–5 BP**. Purchased items can be re-equipped for free, and each has its own pixel-art colors/shapes. Older earned equipment and skins stay in the save.
- **Gem techniques:** 12 XP per hero level; stones can still upgrade Attack, Mining and Defence skill tiers as before. Purchased gear bonuses also contribute to actual odds.
- **Real-life rewards:** Tokyo SHIFT car coupon for 5 BP, or ten extra minutes of tech for 15 BP, logged for adult delivery confirmation.

**Accounting:** encounters are not purchased with BP; they are minted only from eligible 3/3 closed dates, with each date consumed once on an actual Attack/Dig. Flee and modal closure consume neither BP nor encounters. BP is deducted once only for purchases or real-life reward redemptions, without changing daily achievement history.

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
