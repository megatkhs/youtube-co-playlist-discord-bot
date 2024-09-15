import { prisma } from "@/libs/prisma";
import { attachEvents } from "@/utils/event";
import { Client, GatewayIntentBits } from "discord.js";

async function main() {
  console.log("Bot起動中");

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  attachEvents(client);

  client.login();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
