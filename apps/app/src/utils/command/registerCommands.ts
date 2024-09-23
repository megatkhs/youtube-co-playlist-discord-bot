import { env } from "@/libs/env";
import {
  REST,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import { collectCommands } from "./collectCommands";

const commands: Promise<RESTPostAPIChatInputApplicationCommandsJSONBody[]> =
  collectCommands().then((commands) =>
    commands.map(({ name, description }) => {
      const slashCommand = new SlashCommandBuilder().setName(name);

      if (description) {
        slashCommand.setDescription(description);
      }

      return slashCommand.toJSON();
    }),
  );

const rest = new REST().setToken(env.DISCORD_TOKEN);

export async function registerCommands(guildId: string) {
  try {
    await rest.put(
      Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, guildId),
      {
        body: await commands,
      },
    );
    console.log(`guildId:${guildId}にコマンドを登録しました`);
  } catch (error) {
    console.log(`guildId:${guildId}にコマンドを登録できませんでした`);
    console.error(error);
  }
}
