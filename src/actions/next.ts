import { Action, action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

interface RepeatSchema {
	mode: string;
}

let mode: string;



/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "com.maxish.th-ch-ytm-api-server-integration.next" })
export class Next extends SingletonAction {
	private pollTimer?: NodeJS.Timeout;

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed. Stream Deck provides various events for tracking interaction
	 * with devices including key down/up, dial rotations, and device connectivity, etc. When triggered, {@link ev} object contains information about the event including any payloads
	 * and action information where applicable. 
	 */
	override async onKeyDown(ev: KeyDownEvent): Promise<void> {
		// Update the count from the settings.
		streamDeck.logger.info(`Next song`);

		await fetch("http://127.0.0.1:26538/api/v1/next", {
			method: "POST",
		});

		await ev.action.setImage("imgs/actions/next/nextf1.png");
		await wait(100);
		await ev.action.setImage("imgs/actions/next/nextf2.png");
		await wait(100);
		await ev.action.setImage("imgs/actions/next/nextf3.png");
		await wait(100);		
		await ev.action.setImage("imgs/actions/next/nextf0.png");

	}

}

