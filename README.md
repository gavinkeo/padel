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

## PPC I recovered

The first championship's photographic standings and fixture sheet show James O'Leary winning with 151 points, 6 wins and 1 loss; Sean Kelly finished second on 120, Gavin Keohane third on 118. All 8 complete standings and 14 pairings are preserved. Individual match scores are unknown; the Padelution source has been linked but its content could not be fetched. Unverified match scores are intentionally blank. The recorded date remains unconfirmed.

Source: https://www.padelution.com/americano/9d8c91c7-8ad4-4ce8-8df9-7e5c8c425281

Eight arcade-style portraits derived from a labelled group photograph are in `assets/players/`. `portraits.js` maps them to the eight identified colleagues, while unidentified players keep generic illustrations. Confirm whether the original paper standings name “Ger O'Brien” corresponds to the colleague known as “Geraldo” before treating that alias as definitive.
