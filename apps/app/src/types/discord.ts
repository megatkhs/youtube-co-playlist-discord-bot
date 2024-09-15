import type { ClientEvents, CommandInteraction } from "discord.js";

export type ModuleFile<T> = {
  default: T;
};

export type EventModule<
  EventName extends keyof ClientEvents = keyof ClientEvents,
  Args extends Array<unknown> = ClientEvents[EventName],
> = {
  name: EventName;
  once?: (...args: Args) => void;
  on?: (...args: Args) => void;
};

export type SlashCommandModule = {
  name: string;
  description?: string;
  options?: CommandOption[];
  execute: (interaction: CommandInteraction) => void;
};

export type CommandOption = CommandOptionBase;

export type CommandOptionBase = {
  name: string;
  description?: string;
  requird?: boolean;
};
