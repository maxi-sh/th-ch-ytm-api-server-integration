import streamDeck from "@elgato/streamdeck";

import { TogglePlay } from "./actions/toggle-play";
import { ToggleLike } from "./actions/toggle-like";
import { RepeatState } from "./actions/repeat-state";
import { Shuffle } from "./actions/shuffle";
import { Next } from "./actions/next";
import { Previous } from "./actions/previous";
import { Thumbnail } from "./actions/thumbnail";
import { Volume } from "./actions/volume";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel("trace");

// Register the toggle play action.
streamDeck.actions.registerAction(new TogglePlay());

// Register the toggle like action.
streamDeck.actions.registerAction(new ToggleLike());

// Register the repeat state action.
streamDeck.actions.registerAction(new RepeatState());

// Register the shuffle state action.
streamDeck.actions.registerAction(new Shuffle());

// Register the next action.
streamDeck.actions.registerAction(new Next());

// Register the previous action.
streamDeck.actions.registerAction(new Previous());

//Register the thumbnail action.
streamDeck.actions.registerAction(new Thumbnail());

//Register the volume action.
streamDeck.actions.registerAction(new Volume());

// Finally, connect to the Stream Deck.
streamDeck.connect();
