/**
 * Represents a single leaderboard entry
 */
export type LeaderboardEntry = {
	score: number;
	timestamp: string; // formatted timestamp
};

/**
 * ResultsScreenModel - Stores final score and leaderboard
 */
export class ResultsScreenModel {
	private finalScore = 0;
	private leaderboard: LeaderboardEntry[] = [];

	/**
	 * Set the final score
	 */
	setFinalScore(score: number): void {
		this.finalScore = score;
	}

	/**
	 * Get the final score
	 */
	getFinalScore(): number {
		return this.finalScore;
	}

	/**
	 * Set the leaderboard entries
	 */
	setLeaderboard(entries: LeaderboardEntry[]): void {
		this.leaderboard = entries;
	}

	/**
	 * Get the leaderboard entries
	 */
	getLeaderboard(): LeaderboardEntry[] {
		return this.leaderboard;
	}
}

/** Validate persisted data before either storage implementation uses it. */
export function parseLeaderboard(value: unknown): LeaderboardEntry[] {
	if (!Array.isArray(value) || !value.every(entry =>
		typeof entry === "object" && entry !== null &&
		Number.isSafeInteger(entry.score) && entry.score >= 0 &&
		typeof entry.timestamp === "string" && entry.timestamp.trim().length > 0
	)) {
		throw new Error("Invalid leaderboard data");
	}
	return value.map(entry => ({ score: entry.score, timestamp: entry.timestamp }))
		.sort((a, b) => b.score - a.score).slice(0, 5);
}
