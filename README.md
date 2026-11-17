# Pinnacle Padel Cup (PPC)

Independent workplace padel group website. Return event: Friday 4 December 2026, 10:00–12:00, at Padel Tennis Ireland, Carrigtwohill, Cork.

## Confirmed results from paper score sheets

- **PPC III:** Dan 137 points, Gavin runner-up with 121.
- **PPC IV:** James 140 points, Dan runner-up with 136.
- **B2Cup:** HipEx 411–309 Poly (three courts, five rounds).

Individual PPC matches award **32 combined points**; the special B2Cup matches awarded **48**. Every round and score has been preserved in the Hall of Fame and in `data/official-results.json`.

Event dates are **not visible** on the sheets, so are kept unconfirmed. PPC I and II are pending authentic records. The December 4 participant list is **not** confirmed; the organiser must select exactly eight participants to generate the draw.

## Project files

- `index.html`: page structure and archive overlays
- `styles.css`: visual design and responsive layout
- `app.js`: seed historic data, game-card editor, fixture engine, scoring, leaderboard, archive
- `avatars.js`: 12 original fictional arcade-style character images, embedded as data URLs for hosting simplicity
- `data/official-results.json`: machine-readable copy of historic scores
- `tests/historical.test.mjs`: tests of historic records

## GitHub Pages

Open **Settings → Pages → Build and deployment → Source: GitHub Actions**, then push to main (or manually start the deployment workflow). Expected URL: https://gavinkeo.github.io/padel/

The site is static, with no backend. Player edits and new scores save **to the organiser's current browser only**, not to GitHub or other phones. Use EXPORT/IMPORT data backup after each event. A hosted database and authentication will be needed for shared real-time leaderboards and administrator controls.

This is an independent group, not an official site of Johnson & Johnson, DePuy Synthes, or the venue. Cartoon portraits are fictional and **not likenesses**. Obtain player permission before sharing real photos or full names publicly.

## PPC I — complete, 22 November 2024

The original Padelution [match record](https://www.padelution.com/americano/9d8c91c7-8ad4-4ce8-8df9-7e5c8c425281) identifies the date as **22 November 2024**. The organiser provided a screenshot of all **14 match scores**: seven rounds across Courts 2 and 3, each 32 points. All 14 results have been transcribed and verified mathematically against the eight-player standings. **James O'Leary** won with 151 points (6–1), ahead of Sean Kelly (120) and Gavin Keohane (118). Round 6 Court 3 is **9–23**, which reconciles every player's official totals.

**Name pending confirmation:** Padelution names one participant **Ger O'Brien**, while other historic tournaments refer to **Geraldo**. The site still uses the existing provisional roster link but preserves the original spelling as source metadata; identity should be confirmed by the organiser before definitive lifetime stats are combined.
