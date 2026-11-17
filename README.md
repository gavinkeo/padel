# Padel Pinnacle Cup (PPC)

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

**Confirmed identity:** Ger O'Brien and Geraldo are the same player. His PPC I match and standings entry is **Ger O'Brien**, his nickname is **Geraldo**, and all historic events use the stable `p-geraldo` player ID.
## PPC II: final standings and the organiser's incident report

PPC II final standings (supplied screenshot): James O'Leary **141 points (7–0)**, Connell McBride **118**, Daniel McCarthy **116**, Gary Foolkes **115**, Sean Kelly **115**, Kennedy Murphy **99**, Gavin Keohane **96**, and Ger O'Brien (“Geraldo”) **96**. All played seven matches; points total 896, points differences sum to zero. The original round-by-round fixtures, scores and event date are **not available** and have not been invented.

The organiser reports that **an administrative scheduling error caused Gavin to face No. 1 seed and eventual champion James O'Leary three times rather than the intended twice**. The organiser also confirms Gavin competed while suffering **man flu**. The archive notes these mitigating circumstances beside the official seventh-place finish without altering the standings.

**Confirmed by the organiser:** Daniel McCarthy is Dan, combining all his PPC II–IV career points. Connell McBride played PPC II only.

## 2026 Homepage design
A simplified royal-blue, white and tennis-ball-yellow homepage: countdown to Friday 4 December 2026, live cumulative all-time Order of Merit, and clickable four PPC tournaments plus the B2Cup. The player roster and Americano scoring tools remain available inside the collapsible Club HQ panel to keep the public homepage uncluttered.

The Order of Merit sums scored points from **individual PPC events with verified final standings** (PPC I–IV), not the 48-point team B2Cup. It shows appearances and titles separately. The all-time totals at launch include Gavin Keohane 467, Kennedy Murphy 433, James O'Leary 432, and Daniel McCarthy 389 points. Historic tournament dates are not invented.

## Roll of Honour

The homepage now shows the **Roll of Honour** before Order of Merit. Individual PPC title winners are calculated from the verified archive: James O'Leary **3 titles** (PPC I, II, IV) and Daniel McCarthy / Dan **1 title** (PPC III). The HipEx v Poly B2Cup is a separate team contest, excluded from individual title counts. The cards update when future tournaments are archived; the cup badges open the original match archive.

## Profile portrait and interface update (November 2026)

The eight original cartoon illustrations are now their matching 1000×1000 high-resolution sources, with no change of art style. A ninth matching portrait was created for Daniel McCarthy. Players without a custom portrait use the grey anonymous avatar at `assets/players/default.svg`, **not** a random or duplicate player's face. Opening a player card shows a high-resolution portrait and career statistics; editing is now under an optional expandable section. Countdown labels read **Days, Hours, Minutes** and the public homepage language was simplified. All results, Order of Merit, Hall of Fame and club scoring functionality remain intact.
