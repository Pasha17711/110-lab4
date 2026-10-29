import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { GameScreenModel } from "./GameScreenModel.ts";
import { GameScreenView } from "./GameScreenView.ts";
import { GAME_DURATION } from "../../constants.ts";

/** Coordinates game logic between the model and view. */
export class GameScreenController extends ScreenController {
	private model: GameScreenModel;
	private view: GameScreenView;
	private screenSwitcher: ScreenSwitcher;
	private gameTimer: number | null = null;
	private squeezeSound: HTMLAudioElement;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.model = new GameScreenModel();
		this.view = new GameScreenView(() => this.handleLemonClick());
		this.squeezeSound = new Audio("/squeeze.mp3");
	}

	/** Reset all gameplay state before starting a new round. */
	startGame(): void {
		this.stopTimer();
		this.model.reset();
		this.view.updateScore(this.model.getScore());
		this.view.updateTimer(GAME_DURATION);
		this.view.centerLemon();
		this.view.show();
		this.startTimer();
	}

	private startTimer(): void {
		this.stopTimer();
		let timeRemaining = GAME_DURATION;
		this.gameTimer = window.setInterval(() => {
			timeRemaining--;
			this.view.updateTimer(timeRemaining);
			if (timeRemaining <= 0) {
				this.endGame();
			}
		}, 1000);
	}

	private stopTimer(): void {
		if (this.gameTimer !== null) {
			window.clearInterval(this.gameTimer);
			this.gameTimer = null;
		}
	}

	private handleLemonClick(): void {
		if (this.gameTimer === null) return;

		this.model.incrementScore();
		this.view.updateScore(this.model.getScore());
		this.view.randomizeLemonPosition();
		this.squeezeSound.currentTime = 0;
		void this.squeezeSound.play().catch((error) => {
			console.warn("Unable to play /squeeze.mp3:", error);
		});
	}

	private endGame(): void {
		this.stopTimer();
		this.screenSwitcher.switchToScreen({
			type: "result",
			score: this.model.getScore(),
		});
	}

	/** Prevent an old round's timer from running after navigation. */
	override hide(): void {
		this.stopTimer();
		super.hide();
	}

	getFinalScore(): number {
		return this.model.getScore();
	}

	getView(): GameScreenView {
		return this.view;
	}
}
