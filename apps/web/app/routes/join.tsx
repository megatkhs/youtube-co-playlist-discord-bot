import { redirect } from "@remix-run/node";

export function loader() {
  console.log(process.env);
  if (process.env.DISCORD_OAURH2_URL != null) {
    throw redirect(process.env.DISCORD_OAURH2_URL);
  }

  throw new Error("Discord OAuth2 URL is not set");
}
