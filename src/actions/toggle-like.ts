import { Action, action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

interface LikeSchema {
	state: string;
}

let state: string;
let anim: boolean = false;
let delay = 100;
const MAXDELAY = 30000;

/**
 * An action class that should toggle the like state of the current song.
 */
@action({ UUID: "com.maxish.th-ch-ytm-api-server-integration.toggle-like" })
export class ToggleLike extends SingletonAction {
	private pollTimer?: NodeJS.Timeout;

	override async onWillAppear(ev: WillAppearEvent<any>): Promise<void> {
		this.pollTimer = setInterval(async () => {
			let data: LikeSchema;
			try {
				const res = await fetch("http://127.0.0.1:26538/api/v1/like-state")
				data = (await res.json()) as LikeSchema;
				delay = 100;
				if (!anim) {
					await ev.action.setImage(
						data.state === "LIKE"
							? "imgs/actions/toggle-like/like.png"
							: "imgs/actions/toggle-like/dislike.png"
					);
				}
				state = data.state;
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
		// There currently isn't a way to "unlike" a song, so we only like for now.
		streamDeck.logger.info(`Like button pressed`);
		anim = true;
		const res = await fetch("http://127.0.0.1:26538/api/v1/like-state")
		const data = (await res.json()) as LikeSchema;
		await fetch("http://127.0.0.1:26538/api/v1/like", {
			method: "POST",
		});

		if (data.state !== "LIKE") {
			await ev.action.setImage("imgs/actions/toggle-like/dislike.png");
			await wait(100)
			await ev.action.setImage("imgs/actions/toggle-like/likef1.png");
			await wait(100)
			await ev.action.setImage("imgs/actions/toggle-like/likef2.png");
			await wait(100)
			await ev.action.setImage("imgs/actions/toggle-like/like.png");
		} else {
			await wait(100)
			await ev.action.setImage("imgs/actions/toggle-like/like.png");
			await wait(100)
			await ev.action.setImage("imgs/actions/toggle-like/likef2.png");
			await wait(100)
			await ev.action.setImage("imgs/actions/toggle-like/likef1.png");
			await wait(100)
			await ev.action.setImage("imgs/actions/toggle-like/dislike.png");
		}
		anim = false;

	} 
}

