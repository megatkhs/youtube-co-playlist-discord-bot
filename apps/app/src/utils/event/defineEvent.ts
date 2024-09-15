import type { EventModule } from "@/types/discord";
import type { ClientEvents } from "discord.js";

/** イベントハンドラを定義する */
export function defineEvent<K extends keyof ClientEvents>(
  module: EventModule<K>,
): EventModule<K> {
  return module;
}
