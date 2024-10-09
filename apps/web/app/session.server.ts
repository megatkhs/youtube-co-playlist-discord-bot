import crypto from "node:crypto";
import { createSessionStorage } from "@remix-run/node";
import { Redis } from "ioredis";

const client = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

function expiresToSeconds(expires: Date): number {
  const now = new Date();
  const expiresDate = new Date(expires);
  const secondsDelta = Math.round(
    (expiresDate.getTime() - now.getTime()) / 1000,
  );
  return Math.max(secondsDelta, 0);
}

if (!process.env.DOMAIN || !process.env.SESSION_SECRET) {
  throw new Error("環境変数 `DOMAIN`または`SESSION_SECRET` が未定義です");
}

export const { getSession, commitSession, destroySession } =
  createSessionStorage({
    cookie: {
      name: "__session",
      domain: process.env.DOMAIN,
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
      secrets: [process.env.SESSION_SECRET],
      secure: process.env.NODE_ENV === "production",
    },
    async createData(data, expires) {
      const id = crypto.randomUUID();

      if (expires) {
        await client.set(
          id,
          JSON.stringify(data),
          "EX",
          expiresToSeconds(expires),
        );
      } else {
        await client.set(id, JSON.stringify(data));
      }

      return id;
    },
    async readData(id) {
      const data = await client.get(id);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    },
    async updateData(id, data, expires) {
      if (expires) {
        await client.set(
          id,
          JSON.stringify(data),
          "EX",
          expiresToSeconds(expires),
        );
      } else {
        await client.set(id, JSON.stringify(data));
      }
    },
    async deleteData(id) {
      await client.del(id);
    },
  });
