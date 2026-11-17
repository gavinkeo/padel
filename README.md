# Padel Pinnacle Cup (PPC)

A public, read-only archive for a workplace padel group in Cork, Ireland.

**Website:** https://gavinkeo.github.io/padel/

The next tournament, PPC V, is scheduled for **Friday 4 December 2026, 10:00–12:00**, at Padel Tennis Ireland, Carrigtwohill. The homepage features a compact countdown.

## Homepage

- Roll of Honour: James O'Leary **3 titles** (PPC I, II, IV); Daniel McCarthy **1 title** (PPC III).
- Order of Merit: all-time individual PPC points (B2Cup excluded because it uses a separate 48-point team format).
- Previous tournaments: clickable standings, real match results, and the PPC II scheduling note.
- Player profiles: compact avatar cards at the bottom. Clicking shows highest PPC score, number of PPC events, **median** PPC score, tournament-by-tournament results and B2Cup honours.

The **median** of individual PPC event totals is displayed as a robust typical score. A single unusually poor result has less influence on the median than on the arithmetic mean. With two events, it is the average of the two; with one event, it equals that event's score. This does **not** discard actual results from the lifetime Order of Merit.

The six winning HipEx B2Cup players were Gavin Keohane, James O'Leary, Ger O'Brien ("Geraldo"), Sean Kelly, Gary Foolkes and Kennedy Murphy. The six Poly participants were Daniel McCarthy ("Dan"), Jack, Cian O'Connor, Ciaran Kearney, Luke Murphy and Ciaran Barry ("Bean").

## Historical dates

The club organiser confirmed the dates below:

| Event | Date | Champion |
|---|---|---|
| PPC I | 10 December 2024 | James O'Leary (151 points) |
| PPC II | 20 December 2024 | James O'Leary (141 points) |
| B2Cup | 21 January 2025 | HipEx, 411–309 |
| PPC III | 11 February 2025 | Daniel McCarthy (137 points) |
| PPC IV | 14 March 2025 | James O'Leary (140 points) |

**Date discrepancy:** The earlier Padelution screenshot for PPC I displayed *22 November 2024*, which conflicts with the organiser's later confirmation of *10 December 2024*. The website uses the organiser-confirmed date while preserving the original Padelution link and verified scores.

PPC I includes 14 verified match scores, PPC II has standings only (its individual match sheets were not provided), PPC III and IV each have 14 matches, and B2Cup has 15 matches across five rounds.

## Read-only site

Tournament creation, fixture generation, score editing, profile editing and local-only export/import have been removed from the public interface. Historical records are maintained in GitHub and deployed through GitHub Pages.

Files:
- `index.html` — homepage, results/profile dialogs
- `styles.css` — responsive blue/white/tennis-ball-yellow styling
- `app.js` — view rendering, median and player statistics
- `portraits.js` — links to the existing high-resolution cartoon portraits
- `assets/players/default.svg` — grey anonymous avatar for players without custom artwork
- `data/official-results.json` — official historical results and organiser-confirmed dates
- `tests/historical.test.mjs` — integrity and interface checks

Run checks: `node --test tests/historical.test.mjs`.

To preview locally, serve the repository directory over HTTP (for example `python -m http.server 8000`). Some browsers block the JSON fetch when opening `index.html` directly with a file URL.

## GitHub Pages deployment

In the repository's Settings → Pages, set **Source: GitHub Actions**. The deployment workflow runs the tests and copies the site **including the data folder** into the GitHub Pages artifact.

The PPC is an independent workplace social group, not affiliated with or endorsed by its employer, manufacturers or the venue.
