import type { ClientEvents } from "discord.js";

export interface ModuleFile<T> {
	default: T;
}

export interface EventModule<
	EventName extends keyof ClientEvents = keyof ClientEvents,
	Args extends Array<unknown> = ClientEvents[EventName],
> {
	name: EventName;
	once?: (...args: Args) => void;
	on?: (...args: Args) => void;
}
