import * as v from "valibot";

const schema = v.object({
	DISCORD_TOKEN: v.string(),
	DISCORD_CLIENT_ID: v.string(),
});

export const env = v.parse(schema, {
	DISCORD_TOKEN: process.env.DISCORD_TOKEN,
	DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
});
