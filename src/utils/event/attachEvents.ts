import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { EventModule, ModuleFile } from "@/types/discord";
import type { Client } from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function attachEvents(client: Client): Promise<void> {
	const eventsPath = path.join(__dirname, "../../events");
	const eventFiles = fs
		.readdirSync(eventsPath)
		.filter((file) => file.endsWith(".ts"));

	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const { default: event }: ModuleFile<EventModule> = await import(filePath);

		if (event.once) {
			client.once(event.name, event.once);
		} else if (event.on) {
			client.on(event.name, event.on);
		}
	}
}
