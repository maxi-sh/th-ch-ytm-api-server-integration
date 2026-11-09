import { Action, action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

interface SetVolumeSchema {
	volume: number;
}

interface VolumeSchema {
	state: number;
	isMuted: boolean;
}

type Settings = {
	state: string;
	increment: string;
}

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "com.maxish.th-ch-ytm-api-server-integration.volume" })
export class Volume extends SingletonAction {
	private pollTimer?: NodeJS.Timeout;

	override async onWillAppear(ev: WillAppearEvent<any>): Promise<void> {
		const settings = ev.payload.settings as Settings;
	}

	/**
		 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed. Stream Deck provides various events for tracking interaction
		 * with devices including key down/up, dial rotations, and device connectivity, etc. When triggered, {@link ev} object contains information about the event including any payloads
		 * and action information where applicable. 
		 */
	override async onKeyDown(ev: KeyDownEvent): Promise<void> {
		const settings = ev.payload.settings as Settings;
		streamDeck.logger.info(`Volume button pressed. Current state: ${settings.state} & increment: ${Number.parseInt(settings.increment)}`);
		let volume: SetVolumeSchema = { volume: 0 };

		try {
			const res = await fetch("http://127.0.0.1:26538/api/v1/volume")
			const data = (await res.json()) as VolumeSchema;
			volume = { volume: data.state };
		} catch (error) {
			streamDeck.logger.error(`Error fetching volume: ${error}`);
			return;
		}

		if (settings.state === "up") {
			volume.volume = Math.min(100, volume.volume + Number.parseInt(settings.increment));

		} else if (settings.state === "down") {
			volume.volume = Math.max(0, volume.volume - Number.parseInt(settings.increment));
		}

		if (settings.state === "up" || settings.state === "down") {
			var resp = await fetch("http://127.0.0.1:26538/api/v1/volume", {
				method: "POST",
				body: JSON.stringify({ "volume": volume.volume }),
			}); 
			streamDeck.logger.info(resp);
		} else {
			await fetch("http://127.0.0.1:26538/api/v1/toggle-mute", {
				method: "POST",
			});
		}
	}
}

streamDeck.connect();