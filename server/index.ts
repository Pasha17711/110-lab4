import express from "express";
import type { ErrorRequestHandler } from "express";
import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { parseLeaderboard, type LeaderboardEntry } from "../src/screens/ResultsScreen/ResultsScreenModel.ts";

const LEADERBOARD_FILE = new URL("./leaderboard.json", import.meta.url);
const TEMP_FILE = new URL("./leaderboard.json.tmp", import.meta.url);

function loadLeaderboard(): LeaderboardEntry[] {
	if (!existsSync(LEADERBOARD_FILE)) return [];
	return parseLeaderboard(JSON.parse(readFileSync(LEADERBOARD_FILE, "utf-8")));
}

function saveLeaderboard(entries: LeaderboardEntry[]): void {
	writeFileSync(TEMP_FILE, JSON.stringify(entries, null, 2) + "\n");
	renameSync(TEMP_FILE, LEADERBOARD_FILE);
}

const app = express();
app.use(express.json());

app.get("/api/leaderboard", (_req, res) => {
	res.json(loadLeaderboard());
});

app.post("/api/leaderboard", (req, res) => {
	let entries: LeaderboardEntry[];
	try {
		entries = parseLeaderboard(req.body);
	} catch {
		res.status(400).json({ error: "Expected an array of nonnegative integer scores with timestamps." });
		return;
	}
	saveLeaderboard(entries);
	res.json({ message: "Saved" });
});

const handleError: ErrorRequestHandler = (error, _req, res, _next) => {
	console.error("Leaderboard API error:", error);
	const status = error.status === 400 ? 400 : 500;
	res.status(status).json({ error: status === 400 ? "Invalid JSON request." : "Unable to read or write server/leaderboard.json." });
};
app.use(handleError);

app.listen(3001, () => {
	console.log("Leaderboard API running at http://localhost:3001/api/leaderboard");
});
