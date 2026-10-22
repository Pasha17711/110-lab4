import express from "express";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

type LeaderboardEntry = { score: number; timestamp: string };

const LEADERBOARD_FILE = new URL("./leaderboard.json", import.meta.url);

function loadLeaderboard(): LeaderboardEntry[] {
	if (!existsSync(LEADERBOARD_FILE)) return [];
	return JSON.parse(readFileSync(LEADERBOARD_FILE, "utf-8")) as LeaderboardEntry[];
}

function saveLeaderboard(entries: LeaderboardEntry[]): void {
	writeFileSync(LEADERBOARD_FILE, JSON.stringify(entries));
}

const app = express();
app.use(express.json());

app.get("/api/leaderboard", (_req, res) => {
	res.json(loadLeaderboard());
});

app.post("/api/leaderboard", (req, res) => {
	saveLeaderboard(req.body);
	res.json({ message: "Saved" });
});

app.listen(3001, () => {
	console.log("Leaderboard server running at http://localhost:3001");
});
