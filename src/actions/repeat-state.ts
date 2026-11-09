import { Action, action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

interface RepeatSchema {
	mode: string;
}

let mode: string;
let anim: boolean = false;
let delay = 100;
const MAXDELAY = 30000;


/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "com.maxish.th-ch-ytm-api-server-integration.repeat-state" })
export class RepeatState extends SingletonAction {
	private pollTimer?: NodeJS.Timeout;

	override async onWillAppear(ev: WillAppearEvent<any>): Promise<void> {
		this.pollTimer = setInterval(async () => {
			let data: RepeatSchema;
			try {
				const res = await fetch("http://127.0.0.1:26538/api/v1/repeat-mode")
				data = (await res.json()) as RepeatSchema;
				delay = 100;
				
				if (data.mode == "NONE") {
					await ev.action.setImage("imgs/actions/repeat-state/repeatOff.png");
				} else if (data.mode == "ONE") {
					await ev.action.setImage("imgs/actions/repeat-state/repeatOne.png");
				} else {
					if (!anim) {
						await ev.action.setImage("imgs/actions/repeat-state/repeat.png");
					}
				}
				mode = data.mode;
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
		streamDeck.logger.info(`Repeat button pressed`);
		anim = true;
		const res = await fetch("http://127.0.0.1:26538/api/v1/repeat-mode")
		const data = (await res.json()) as RepeatSchema; 
		await fetch("http://127.0.0.1:26538/api/v1/switch-repeat", {
			method: "POST",
			body: JSON.stringify({ "iteration": 1 }),
		});

		if (data.mode == "NONE") {
			await ev.action.setImage("imgs/actions/repeat-state/repeatf1.png");
			await wait(100)
			await ev.action.setImage("imgs/actions/repeat-state/repeatf2.png");
			await wait(100)
			await ev.action.setImage("imgs/actions/repeat-state/repeat.png");
		} else if (data.mode == "ONE") {
			await wait(100)
			await ev.action.setImage("imgs/actions/repeat-state/repeat.png");
			await wait(100)
			await ev.action.setImage("imgs/actions/repeat-state/repeatf2.png");
			await wait(100)
			await ev.action.setImage("imgs/actions/repeat-state/repeatf1.png");
		}
		anim = false;

	}

}

