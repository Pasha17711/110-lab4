import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { ResultsScreenModel, type LeaderboardEntry, parseLeaderboard } from "./ResultsScreenModel.ts";
import { ResultsScreenView } from "./ResultsScreenView.ts";

const LEADERBOARD_KEY = "lemonClickerLeaderboard";

/** Coordinates results independently of the selected persistence mechanism. */
export class ResultsScreenController extends ScreenController {
	private model = new ResultsScreenModel();
	private view: ResultsScreenView;
	private screenSwitcher: ScreenSwitcher;
	private gameOverSound = new Audio("/gameover.mp3");
	private resultsVersion = 0;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new ResultsScreenView(() => this.screenSwitcher.switchToScreen({ type: "menu" }));
	}

	private beginResults(finalScore: number): number {
		this.model.setFinalScore(finalScore);
		this.model.setLeaderboard([]);
		this.view.updateFinalScore(finalScore);
		this.view.updateLeaderboard([]);
		this.view.updateStatus("");
		// Always render before attempting storage or network operations.
		this.view.show();
		this.gameOverSound.currentTime = 0;
		void this.gameOverSound.play().catch(error => console.warn("Unable to play /gameover.mp3:", error));
		return ++this.resultsVersion;
	}

	private addScore(entries: LeaderboardEntry[], finalScore: number): LeaderboardEntry[] {
		return [...entries, { score: finalScore, timestamp: new Date().toLocaleString() }]
			.sort((a, b) => b.score - a.score).slice(0, 5);
	}

	private displayLeaderboard(entries: LeaderboardEntry[]): void {
		this.model.setLeaderboard(entries);
		this.view.updateLeaderboard(entries);
	}

	showResults(finalScore: number): void {
		this.beginResults(finalScore);
		try {
			const top5 = this.addScore(this.loadLeaderboard(), finalScore);
			this.displayLeaderboard(top5);
			this.saveLeaderboard(top5);
		} catch (error) {
			console.error("Local leaderboard failed:", error);
			this.view.updateStatus("Browser storage unavailable or invalid. This score was not saved.");
		}
	}

	private loadLeaderboard(): LeaderboardEntry[] {
		const json = localStorage.getItem(LEADERBOARD_KEY);
		return json === null ? [] : parseLeaderboard(JSON.parse(json));
	}

	private saveLeaderboard(entries: LeaderboardEntry[]): void {
		localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
	}

	async loadLeaderboardFromServer(): Promise<LeaderboardEntry[]> {
		const response = await fetch("/api/leaderboard", { signal: AbortSignal.timeout(5000) });
		if (!response.ok) throw new Error(`Unable to load leaderboard (HTTP ${response.status})`);
		return parseLeaderboard(await response.json());
	}

	async saveLeaderboardToServer(entries: LeaderboardEntry[]): Promise<void> {
		const response = await fetch("/api/leaderboard", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(entries),
			signal: AbortSignal.timeout(5000),
		});
		if (!response.ok) throw new Error(`Unable to save leaderboard (HTTP ${response.status})`);
	}

	async showResultsFromServer(finalScore: number): Promise<void> {
		const version = this.beginResults(finalScore);
		this.view.updateStatus("Loading server leaderboard…");
		try {
			const entries = await this.loadLeaderboardFromServer();
			const top5 = this.addScore(entries, finalScore);
			if (version === this.resultsVersion) {
				this.displayLeaderboard(top5);
				this.view.updateStatus("Saving score…");
			}
			await this.saveLeaderboardToServer(top5);
			if (version === this.resultsVersion) this.view.updateStatus("");
		} catch (error) {
			console.error("Server leaderboard failed:", error);
			if (version === this.resultsVersion) {
				this.view.updateStatus("Server leaderboard unavailable. Score not confirmed saved. Check Express on port 3001.");
			}
		}
	}

	override hide(): void {
		// A late response must not update a later round or reopen results.
		this.resultsVersion++;
		this.gameOverSound.pause();
		super.hide();
	}

	getView(): ResultsScreenView {
		return this.view;
	}
}
