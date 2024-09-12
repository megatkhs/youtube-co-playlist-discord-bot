import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ModuleFile, SlashCommandModule } from "@/types/discord";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function collectCommands() {
	const slashCommandsPath = path.join(__dirname, "../../commands/");
	const slashCommandFiles = fs
		.readdirSync(slashCommandsPath)
		.filter((file) => file.endsWith(".ts"));

	return Promise.all(
		slashCommandFiles.map(async (file) => {
			const filePath = path.join(slashCommandsPath, file);
			const modules: ModuleFile<SlashCommandModule> = await import(filePath);
			return modules.default;
		}),
	);
}
