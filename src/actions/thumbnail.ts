import { Action, action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

interface SongInfoSchema {
  title: string;
  artist: string;
  isPaused: boolean;
  imageSrc: string;
}

let imageSrc: string;
let delay = 100;
const MAXDELAY = 30000;


async function imageUrlToBase64(url: string) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:image/jpeg;base64,${base64}`;
}

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Wrap text into lines
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length <= maxChars) {
      current = test;
    } else {
      lines.push(current);
      current = word;
      if (lines.length === 2) break; // max 2 lines
    }
  }
  if (current && lines.length < 2) lines.push(current);
  return lines;
}

async function renderThumbnailWithTextSVG(
  imageUrl: string,
  title: string,
  artist?: string
) {
  const base64Image = await imageUrlToBase64(imageUrl);
  const titleLines = wrapText(title, 7).map(escapeXml);
  const safeArtist = artist ? escapeXml(artist) : "";

  // convert lines to <tspan>
  const titleTspans = titleLines
    .map((line, i) => `<tspan x="72" dy="${i === 0 ? 0 : 16}">${line}</tspan>`)
    .join("");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
  <defs>
    <linearGradient id="textBgFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0"/>
      <stop offset="40%" stop-color="black" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.75"/>
    </linearGradient>
  </defs>

  <!-- background image -->
  <image href="${base64Image}" x="0" y="0" width="144" height="144" preserveAspectRatio="xMidYMid slice"/>

  <!-- darkened gradient behind text -->
  <rect x="0" y="80" width="144" height="64" fill="url(#textBgFade)"/>

  <!-- title text -->
  <text x="72" y="104" fill="white" font-size="16" font-weight="700" font-family="system-ui, -apple-system, Segoe UI, sans-serif" text-anchor="middle">
    ${titleTspans}
  </text>

  <!-- artist text -->
  ${safeArtist
      ? `<text x="72" y="132" fill="rgba(255,255,255,0.9)" font-size="12" font-weight="500" font-family="system-ui, -apple-system, Segoe UI, sans-serif" text-anchor="middle">
          ${safeArtist}
        </text>`
      : ""
    }
</svg>
`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}


/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "com.maxish.th-ch-ytm-api-server-integration.thumbnail" })
export class Thumbnail extends SingletonAction {
  private pollTimer?: NodeJS.Timeout;

  override async onWillAppear(ev: WillAppearEvent<any>): Promise<void> {
    this.pollTimer = setInterval(async () => {
      let data: SongInfoSchema;
      try {
        const res = await fetch("http://127.0.0.1:26538/api/v1/song-info")
        data = (await res.json()) as SongInfoSchema;
				delay = 100;
        imageSrc = data.imageSrc;

        const base64Image = await imageUrlToBase64(data.imageSrc);

        const image = await renderThumbnailWithTextSVG(
          base64Image,
          data.title,
          data.artist
        );

        //	await ev.action.setImage(await imageUrlToBase64(imageSrc));
        await ev.action.setImage(image);
        await ev.action.setTitle(""); // important: disable firmware text
      } catch (error) {
        streamDeck.logger.error(`Error fetching repeat mode: ${error}`);
        wait(delay);
        delay = Math.min(MAXDELAY, delay * 2);
      }
    }, 5000);
  }

  /**
   * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed. Stream Deck provides various events for tracking interaction
   * with devices including key down/up, dial rotations, and device connectivity, etc. When triggered, {@link ev} object contains information about the event including any payloads
   * and action information where applicable. 
   */
  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    // nothing right now
  }

}

