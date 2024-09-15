import { defineEvent } from "@/utils/event";
import { Events } from "discord.js";

export default defineEvent({
  name: Events.ClientReady,
  async once(client) {
    console.log(`${client.user.tag}が起動しました。`);
  },
});
