# Lab 4 final verification

Verified on October 22, 2026 against the twelve official checkoff requirements supplied in the user's request. The existing MVC structure and UI are preserved. Both leaderboard implementations remain intact; Express is the default. No commit or push was performed.

## Final fixes

- `src/screens/GameScreen/GameScreenView.ts`: initialize the timer label from `GAME_DURATION` instead of the stale `Time: 60` placeholder.
- `index.html`: use the existing lemon image as the favicon, resolving the browser's `/favicon.ico` 404; correct the title to Lab 4.
- `package-lock.json`: apply compatible dependency audit fixes with `npm audit fix`, without `--force` or changing declared top-level dependency ranges. Vite moved from 7.1.9 to 7.3.7. Final audit: **0 vulnerabilities** (previously six high).
- `CHECKOFF.md`: replace outdated missing-asset and mock-only statuses with actual browser results and the supplied official checklist.

Earlier implementation files included in this submission: `package.json`, `package-lock.json`, `src/main.ts`, both game/results controllers, `server/index.ts`, and `vite.config.ts`. Assets are `public/lemon.png`, `public/squeeze.mp3`, and `public/gameover.mp3`.

## Build, assets, server and API

- `npm run build`: passed after the final source changes and dependency fixes; no TypeScript errors.
- Additional server/config check passed:

```sh
npx tsc --noEmit --strict --noUnusedLocals --noUnusedParameters --esModuleInterop --module nodenext --moduleResolution nodenext --target es2022 --skipLibCheck server/index.ts vite.config.ts
```

- `npm ls --depth=0`: passed, with no missing/invalid top-level dependencies.
- `npm audit`: zero vulnerabilities after compatible fixes.
- Express started successfully using `npx tsx server/index.ts`; Vite started using `npm run dev` at `http://localhost:5173/`.
- All three assets returned HTTP 200 with correct image/png or audio/mpeg types. Response bytes matched the source files. All three production build assets also matched `public/` byte for byte.
- Chrome loaded the 336×336 lemon image, displayed at 100×100 on the canvas. Both MP3s decoded successfully with non-silent samples: squeeze approximately 2.016 seconds; game-over approximately 5.068 seconds.
- GET and POST `/api/leaderboard` worked through Vite's proxy. POST returned `{ "message": "Saved" }`; GET matched the saved scores and timestamps.
- The browser combined six seeded entries with a real six-click game, sorted them, and saved/displayed exactly `[10, 8, 7, 6, 5]` in each mode.
- After stopping and restarting Express, both the direct port-3001 API and the Vite-proxied API returned the exact saved scores and timestamps, matching `server/leaderboard.json`.
- The API stores the submitted leaderboard snapshot, as required by Task 6; the results controller sorts and limits it to five before POST. The API itself does not independently truncate arbitrary submitted arrays.
- Both test servers were stopped after verification. The generated test leaderboard was removed; no leaderboard file existed before this verification. A real game will create `server/leaderboard.json` automatically.

## Official twelve-item checkoff

Actual headless Chrome was used with real mouse clicks, real timers, browser localStorage, native audio playback, the real Express API and filesystem. Neither views nor storage nor fetch nor timing nor audio playback were mocked. Audio playback was observed by wrapping the native play call without replacing its behavior.

| # | Official requirement | Actual verification |
|---|---|---|
| 1 | Start Game navigates to the game screen | **Verified in both modes:** real mouse click changed visible Konva content to the game. |
| 2 | Lemon image appears centered | **Verified in both modes:** loaded image at (400, 300) on the 800×600 stage, with (50, 50) offsets for a 100×100 image; game screenshot inspected. |
| 3 | Timer counts down from 10 to 0 | **Verified in both modes:** observed every value, with about 9.998 seconds in Express mode and 9.999 seconds in localStorage mode; no further ticks during the 1.2-second observation after results. |
| 4 | Clicking lemon plays squeeze.mp3 | **Verified in both modes:** six real clicks, each reset playback to zero and fulfilled the native play promise; playback time advanced. |
| 5 | Score increases on each click | **Verified in both modes:** each of six clicks advanced the displayed score by one, ending at 6. |
| 6 | Lemon moves randomly after each click | **Verified in both modes:** position changed on all six clicks and remained within the intended bounds; random-coordinate implementation inspected. |
| 7 | At 0, results screen appears and gameover.mp3 plays | **Verified in both modes:** results became visible after zero; game-over play promise fulfilled and playback time advanced. |
| 8 | Leaderboard displays top 5 scores with timestamps | **Verified in both modes:** visible rows and stored data matched descending scores `[10, 8, 7, 6, 5]`, with nonempty timestamps; results screenshot inspected. |
| 9 | localStorage scores persist across browser refreshes | **Verified:** real page reload retained the exact localStorage entries. Express was stopped during this mode's test. |
| 10 | Express saves scores and timestamps in server/leaderboard.json | **Verified:** the browser's completed game wrote exactly the displayed five entries, including timestamps, to the file. |
| 11 | Scores remain after stopping and restarting Express | **Verified:** restarted Express returned identical data directly and through Vite's proxy; file contents also matched. |
| 12 | Play Again returns to the menu | **Verified in both modes:** actual button click made Start Game visible again. |

Additional browser checks: no console errors, uncaught page errors or failed requests in either final run. Express mode issued GET then POST and did not write localStorage. LocalStorage mode issued no API requests and left the server file unchanged. LocalStorage mode was tested by temporarily changing the actual call in `src/main.ts`, then restoring the original Express call.

## Limits and remaining checks

No failing checkoff behavior remains in the tested Chrome environment. Automated playback was verified, but physical speaker/headphone output was not listened to. Before presenting, run one game in your normal browser and confirm both sounds are audible with the tab unmuted. Safari, Firefox, and other browser/device combinations were not tested.

Express mode requires the backend to be running. The lab's server error handler logs failed requests; it does not provide an offline fallback. LocalStorage and Express data are intentionally separate. The Vite `/api` proxy applies to the development server, not arbitrary static production hosting.

## Demonstrate to your TA

From the project root, start two terminals:

```sh
npx tsx server/index.ts
```

```sh
npm run dev
```

Open the URL Vite prints (normally `http://localhost:5173/`). Express mode is the default. Start a game, click lemons, wait for results and demonstrate Play Again. Play several games with different scores, inspect `server/leaderboard.json`, then stop Express with Ctrl+C and restart it. The saved entries remain. The page initially shows the menu; finish another game to display the updated leaderboard.

For Task 5 localStorage mode, in the `result` case of `src/main.ts`, replace:

```ts
void this.resultsController.showResultsFromServer(screen.score);
```

with:

```ts
this.resultsController.showResults(screen.score);
```

Keep only one active call. Both methods and both persistence implementations should stay in the controller. LocalStorage mode only needs Vite; Express can be stopped. Play games, refresh, and inspect the `lemonClickerLeaderboard` localStorage key or finish another game to see retained entries in the results screen. Keep the same browser origin/port when demonstrating persistence.

Restore the Express call for the default Task 6 version before committing.

## Save and push

Run from the project root after reviewing your changes:

```sh
git status
git diff --check
git diff
npm run build
git add package.json package-lock.json index.html src/main.ts src/screens/GameScreen/GameScreenController.ts src/screens/GameScreen/GameScreenView.ts src/screens/ResultsScreen/ResultsScreenController.ts server/index.ts vite.config.ts CHECKOFF.md public/lemon.png public/squeeze.mp3 public/gameover.mp3
git commit -m "Complete and verify CSE 110 Lab 4"
git push -u origin main
```

The inspected branch is `main` and origin is `https://github.com/Pasha17711/110-lab4.git`. These commands do not rewrite history or include generated test scores. No commit or push was made automatically.
