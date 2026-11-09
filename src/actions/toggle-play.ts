import { Action, action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

interface SongInfoSchema {
	title: string;
	artist: string;
	isPaused: boolean;
	imageSrc: string;
}

let isPaused: boolean;
let delay = 100;
const MAXDELAY = 30000;

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "com.maxish.th-ch-ytm-api-server-integration.toggle-play" })
export class TogglePlay extends SingletonAction {
	private pollTimer?: NodeJS.Timeout;

	override async onWillAppear(ev: WillAppearEvent<any>): Promise<void> {
		this.pollTimer = setInterval(async () => {
			try {
				const res = await fetch("http://127.0.0.1:26538/api/v1/song-info")
				const data = (await res.json()) as SongInfoSchema;
				delay = 100;
				isPaused = data.isPaused;
				await ev.action.setImage(
					isPaused
						? "imgs/actions/toggle-play/pause.png"
						: "imgs/actions/toggle-play/play.png"
				);
			} catch (error) {
				streamDeck.logger.error(`Error fetching repeat mode: ${error}`);
				wait(delay);
				delay = Math.min(MAXDELAY, delay * 2);
			}
		}, 1000);
	}

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed. Stream Deck provides various events for tracking interaction
	 * with devices including key down/up, dial rotations, and device connectivity, etc. When triggered, {@link ev} object contains information about the event including any payloads
	 * and action information where applicable. 
	 */
	override async onKeyDown(ev: KeyDownEvent): Promise<void> {
		// Update the count from the settings.
		streamDeck.logger.info(`Toggling play/pause button pressed`);
		const res = await fetch("http://127.0.0.1:26538/api/v1/song-info")
		const data = (await res.json()) as SongInfoSchema;
		isPaused = data.isPaused;

		if (isPaused) {
			await fetch("http://127.0.0.1:26538/api/v1/play", {
				method: "POST",
			});
			streamDeck.logger.info(`playing`);
		} else {
			await fetch("http://127.0.0.1:26538/api/v1/pause", {
				method: "POST",
			});

			streamDeck.logger.info(`pausing`);
		}

	}

}

