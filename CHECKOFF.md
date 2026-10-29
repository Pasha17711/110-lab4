# CSE 110 Lab 4 checkoff

Start two terminals in this folder:

```sh
npm run server
```

```sh
npm run dev
```

Open the frontend URL printed by Vite (normally http://localhost:5173). Keep the same hostname and port when demonstrating localStorage. The backend API is http://localhost:3001/api/leaderboard. `Cannot GET /` at port 3001 is expected.

## Task 6 — Express (default)

In `src/main.ts`, the `case "result"` branch calls:

```ts
void this.resultsController.showResultsFromServer(screen.score);
```

Play a round and show GAME OVER!, the final score, and the timestamped top-five leaderboard. Show `server/leaderboard.json` in VS Code and the API URL in a separate browser tab. Stop Express with Ctrl+C, restart with `npm run server`, and refresh the API tab to demonstrate persistence. Play Again returns to the menu and starts another full round.

If Express is unavailable, results and Play Again still appear, with an explicit unsaved-score message. This mode does not fall back to localStorage.

## Task 5 — localStorage

Replace that single active method call in `src/main.ts` with:

```ts
this.resultsController.showResults(screen.score);
```

Save the file, refresh the frontend, and play a round. In Chrome DevTools, open **Application → Local Storage → the frontend origin** and select `lemonClickerLeaderboard`. Show the scores and timestamps. Refresh and play again to demonstrate persistence. Express may be stopped for this mode; no leaderboard API requests are made.

After demonstrating Task 5, restore the Express call shown above and save.

## Validation commands

```sh
npm run typecheck
npm run build
```

The TypeScript configuration covers `src`, `server`, and `vite.config.ts`. Both original sound files are preserved. Listen to one round on the demonstration computer to confirm speaker volume and the intended sound content.

## Commit and push when ready

Review changes first; include `server/leaderboard.json` only if you intend to publish your demonstration scores.

```sh
git status
git diff
git add index.html package.json tsconfig.json server/index.ts src/screens CHECKOFF.md
git commit -m "Fix Lab 4 results and verify both leaderboard modes"
git push origin HEAD
```

## Verification completed

Automated verification used local Chrome through Playwright. One complete round used the real 10-second timer; additional rounds used browser clock advancement.

| Requirement | Evidence |
| --- | --- |
| 1. Menu transition | Start Game clicked through the canvas; gameplay became visible |
| 2. Lemon image | PNG served successfully, loaded in Chrome, centered at (400, 300) |
| 3. Countdown | Observed 10 → 9 after one second and results after expiration |
| 4. Click sound | Original MP3 decoded; real `playing` event observed |
| 5. Score increments | Two canvas clicks produced final score 2 |
| 6. Random movement | Position changed after clicks and stayed within safe bounds |
| 7. Game Over and sound | Visible title/final score checked, screenshot inspected, MP3 playback observed |
| 8. Top five and timestamps | Both modes retained descending top-five entries with timestamps |
| 9. localStorage persistence | Reload retained `lemonClickerLeaderboard`; next round displayed stored scores |
| 10. JSON persistence | POST response, GET response, and file contents matched |
| 11. Express restart | Stopped/restarted backend; GET returned the same scores |
| 12. Play Again | Returned to menu; another complete round reset score, timer, and lemon |

Also verified: original assets returned HTTP 200; both MP3s decoded to non-silent audio; Express mode left localStorage untouched; local mode made no API requests; failed API requests and corrupt localStorage displayed errors without hiding results; invalid POST data returned 400 without changing stored scores. No uncaught browser errors occurred in the completed test run. Test scores were removed afterward and Express mode was restored.

The saved source built successfully before fixes; the main defect was a runtime transition waiting for successful API requests before showing results. Unsaved VS Code buffers were not accessible through a connected editor session. Automated playback confirms browser playback, not physical speaker output; listen once before checkoff.
