import { Action, action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

interface ShuffleSchema {
	state: boolean;
}

let state: boolean;
let delay = 100;
let anim: boolean = false;
const MAXDELAY = 30000;



/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "com.maxish.th-ch-ytm-api-server-integration.shuffle" })
export class Shuffle extends SingletonAction {
	private pollTimer?: NodeJS.Timeout;

	override async onWillAppear(ev: WillAppearEvent<any>): Promise<void> {
		this.pollTimer = setInterval(async () => {
			let data: ShuffleSchema;
			try {
				const res = await fetch("http://127.0.0.1:26538/api/v1/shuffle")
				data = (await res.json()) as ShuffleSchema;
				delay = 100;

				if (!anim) {
					await ev.action.setImage(
						data.state
							? "imgs/actions/shuffle/shuffle.png"
							: "imgs/actions/shuffle/shuffleOff.png"
					);
				}
				state = data.state;
			} catch (error) {
				streamDeck.logger.error(`Error fetching shuffle state: ${error}`);
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
		streamDeck.logger.info(`Shuffle button pressed`);
		anim = true;
		const res = await fetch("http://127.0.0.1:26538/api/v1/shuffle")
		const data = (await res.json()) as ShuffleSchema;

		await fetch("http://127.0.0.1:26538/api/v1/shuffle", {
			method: "POST",
		});

		if (!data.state) {
			await ev.action.setImage("imgs/actions/shuffle/shuffleOff.png");
			await wait(100)
			await ev.action.setImage("imgs/actions/shuffle/shufflef1.png");
			await wait(100)
			await ev.action.setImage("imgs/actions/shuffle/shuffle.png");
		} else {
			await wait(100)
			await ev.action.setImage("imgs/actions/shuffle/shuffle.png");
			await wait(100)
			await ev.action.setImage("imgs/actions/shuffle/shufflef1.png");
			await wait(100)
			await ev.action.setImage("imgs/actions/shuffle/shuffleOff.png");
		}
		anim = false;

	}

}

