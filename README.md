# BattlePoints — Morning Quest (v2.5)

A phone-first, installable, offline-friendly checklist for Ethan, with an original pixel-art explorer and a very short Battle Journey.

## Morning checklist — matching the physical 10-row slider board

Daily Quests now shows **the exact ten physical rows in the photo, with original wording, punctuation and order**. Each row is **one checkbox**, not four separate subtasks. All three groups are expanded by default and can be collapsed independently.

**Quest 1 — rows 1–4 (1 regular BP)**
1. MAKE BED / TURN OFF PURIFIER
2. WASH FACE, SUNSCREEN / UNIFORM, BED CLOTHES
3. MAKE EGG / MAKE MILK
4. IS KITCHEN COMPLETE?

**Quest 2 — rows 5–7 (1 regular BP)**
5. TEETH, NOSE
6. TOILET, HANDS
7. IS BATHROOM COMPLETE?

**Quest 3 — rows 8–10 (1 regular BP)**
8. LUNCHBOX, WATER, ZIP / BAG CHECKLIST
9. VIT, ANTIHISTAMINES
10. PIANO

Slashes above represent line breaks **within one row** in the app. A quest awards its single regular BP when all its assigned rows are checked. The full 3 BP morning also qualifies for a Journey encounter on End the Morning.

**Medication safety:** row 9 is a check with an adult about **whether** vitamins or antihistamines are needed. Checking it never requires taking medicine, and no medicine should be taken just to earn a point. The redundant separate health checkbox panel was removed from the visible screen; historical health records are retained.

**Piano is now a regular task in row 10**, rather than an additional piano bonus. The old piano-specific bonus approval shortcut was removed, but previously approved or claimed bonuses remain in historical saves. A parent can still offer discretionary extra bonuses for other efforts.

**Existing progress:** old, closed days retain their original BP totals and historical task counts. In-progress current days automatically map previously completed substeps to their equivalent combined rows where all parts were completed. No previously recorded earned BP, Journey purchases, receipts, gems or encounters are deleted.

The sticky countdown timer, parent PIN, risk controls, independent Journey/Real-life wallets, adult-editable rewards and separate Dev profile remain unchanged.

**End the Morning:** records the day's totals, greys out the checklist and locks changes until the next date.

## Battle Journey (adult-PIN unlocked)

The former History tab is **Battle Journey**. Stats, daily records, backups, bonuses and real-world reward delivery confirmations are in the Adult room.

**Access and banking:** each day closed with **3 regular BP** earns one permanent encounter token for **either** battle or mining. Tokens accumulate over days; there is no requirement to play on the day earned. A child can return for multiple encounters on a day when the adult has unlocked Journey. The LIVE tab requires the adult PIN every time Journey is re-entered after leaving it; active DEV testing skips repeat PIN checks. Prior v2 saves' eligible 3/3 days are preserved.

- **Battle:** preview an original friendly pixel-art creature, its Level, HP, Attack, the hero's Attack and Defence, and a numerical win probability. Choose **Attack** or **Flee**. Flee closes the pop-up without consuming BP *or* the encounter. Attacking spends **one encounter but zero BP**, with either 4 XP on a win or 1 XP on a miss.
- **Mining:** preview a pixel-art rock, its Hardness, the hero's Mining Power and a chance of finding a gem. Choose **Dig** or **Leave**. Leaving keeps the encounter; digging consumes one encounter, costing **no BP**. A find awards a random quartz/ruby/sapphire/emerald stone plus 2 XP; an ordinary-rock outcome awards **no gem** and 1 XP. Better pickaxes increase the chance.
- **Batch play:** use Battle several or Mine several with banked encounters. Each individual opponent still gets its own preview and choice, result and Next button. Closing/fleeing mid-batch preserves untouched encounters.
- **Two character kits:** Battle Kit and Mining Kit show the actual equipped skin, armour, weapon or pickaxe on the character, with live stats. Each card now reserves a separate, clipped sprite area above the captions so no character can overlap the title or equipment details, even on narrower phones. The same gear appears in the animated pop-up.
- **Equipment shop:** a one-time 3 BP starter bundle; three additional sword tiers, three pickaxes and three armour sets at **4/8/12 BP**, with progressive level requirements; cosmetic skins at **2–5 BP**. Purchased items can be re-equipped for free, and each has its own pixel-art colors/shapes. Older earned equipment and skins stay in the save.
- **Gem techniques:** 12 XP per hero level; stones can still upgrade Attack, Mining and Defence skill tiers as before. Purchased gear bonuses also contribute to actual odds.
- **Real-life rewards:** default Tokyo SHIFT car coupon costs **15 Real-life BP** and ten extra tech minutes cost **30 Real-life BP**. The Adult panel can edit the reward name, description, integer price (1–10,000 BP), availability, and can add new rewards. Inactive rewards are hidden from the Journey shop. Claims generate receipts awaiting adult fulfilment.

**Two independent BP wallets:** earning 1 BP contributes **one unit to each wallet**, rather than doubling the earned history. Journey BP purchases (starter kit, swords, pickaxes, armour, skins) debit **only Journey BP**. Real-life claims debit **only Real-life BP**. Spending 5 Journey BP doesn't affect available Real-life BP; redeeming 15 Real-life BP doesn't affect available Journey BP. Each wallet is `totalEarnedBP − spendingInThatCategory`. The total earned and per-category receipts remain preserved.

**Existing save migration:** no destructive conversion is necessary. Previous items in the stored `journey.spending[]` array with `kind: "reward"` are treated as Real-life BP spending. Every other previous receipt type is Journey BP spending. Receipt prices already paid are not recalculated when the adult edits catalog prices. Existing daily history, PIN, level, equipment and gems remain untouched. Reward-catalog settings are held **within the active LIVE or DEV profile** (not a shared settings object), maintaining Dev isolation.

**Encounter accounting:** encounters are not purchased with BP. They are minted only from eligible 3/3 closed dates, each date consumed once on Attack/Dig. Flee and modal closure consume neither BP nor encounters.

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
