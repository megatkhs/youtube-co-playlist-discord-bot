import { type Session, isSession } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import {} from "discord.js";
import { prisma } from "./prisma.server";
import { commitSession, getSession } from "./session.server";

const SESSION_STATE_KEY = "oauth2:state";
const USER_INFO_KEY = "userInfo";
const AUTHORIZE_FROM_KEY = "authorizeFrom";
const USER_ACCOUNT_ID_KEY = "userAccountId";

const DISCORD_API_BASE_URL = "https://discord.com/api/v10";
const AUTHORIZATION_URL = `${DISCORD_API_BASE_URL}/oauth2/authorize`;
const TOKEN_URL = `${DISCORD_API_BASE_URL}/oauth2/token`;
const USER_INFO_URL = `${DISCORD_API_BASE_URL}/users/@me`;
const CALLBACK_REDIRECT_PATH = "/auth/callback";
const CONNECT_ACCOUNT_PATH = "/auth/connect_account";

const OAUTH_SCOPES = ["guilds", "email", "identify"];

type Tokens = {
  token_type: "Bearer";
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
};

type DiscordUserInfo = {
  /** the user's id */
  id: string;
  /** the user's username, not unique across the platform */
  username: string;
  /** the user's Discord-tag */
  discriminator: string;
  /** the user's display name, if it is set. For bots, this is the application name */
  global_name: string | null;
  /** the user's avatar hash */
  avatar: string | null;
  /** whether the user belongs to an OAuth2 application */
  bot?: boolean;
  /** whether the user is an Official Discord System user (part of the urgent message system) */
  system?: boolean;
  /** whether the user has two factor enabled on their account */
  mfa_enabled?: boolean;
  /** the user's banner hash */
  banner?: string | null;
  /** the user's banner color encoded as an integer representation of hexadecimal color code */
  accent_color?: number | null;
  /** the user's chosen language option */
  locale?: string;
  /** whether the email on this account has been verified */
  verified?: boolean;
  /** the user's email */
  email?: string | null;
  /** the flags on a user's account */
  flags?: number;
  /** the type of Nitro subscription on a user's account */
  premium_type?: number;
  /** the public flags on a user's account */
  public_flags?: number;
  /** decoration data object	data for the user's avatar decoration */
  avatar_decoration_data?: {
    sku_id: string;
    asset: string;
  } | null;
};

type UserInfo = {
  id: DiscordUserInfo["id"];
  displayName: DiscordUserInfo["global_name"] | DiscordUserInfo["username"];
  email: DiscordUserInfo["email"];
  photo: DiscordUserInfo["avatar"];
  locale: DiscordUserInfo["locale"];
  accessToken: Tokens["access_token"];
  refleshToken: Tokens["refresh_token"];
};

export const authenticate = async (request: Request) => {
  const url = new URL(request.url);

  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    throw new Error(
      "環境変数 `DISCORD_CLIENT_ID` または `DISCORD_CLIENT_SECRET` が未定義です",
    );
  }

  if (url.searchParams.get("error")) {
    throw Error("TODO エラー時の処理");
  }

  const session = await getSession(request.headers.get("Cookie"));
  const stateUrl = url.searchParams.get("state");

  if (!stateUrl) {
    const state = crypto.randomUUID();
    session.set(SESSION_STATE_KEY, state);
    session.set(AUTHORIZE_FROM_KEY, url.pathname);

    const authorizationURL = new URL(AUTHORIZATION_URL);
    authorizationURL.searchParams.set(
      "client_id",
      process.env.DISCORD_CLIENT_ID,
    );
    authorizationURL.searchParams.set("response_type", "code");
    authorizationURL.searchParams.set(
      "redirect_uri",
      new URL(CALLBACK_REDIRECT_PATH, url.origin).toString(),
    );
    authorizationURL.searchParams.set("scope", OAUTH_SCOPES.join(" "));
    authorizationURL.searchParams.set("state", state);

    throw redirect(authorizationURL.toString(), {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  const code = url.searchParams.get("code");

  if (!code) {
    throw Error("TODO Discordアカウントの認証結果に `code` がありません。");
  }

  const stateSession = session.get(SESSION_STATE_KEY);
  if (!stateSession) {
    throw Error("無効なセッションです。");
  }

  if (stateSession === stateUrl) {
    session.unset(SESSION_STATE_KEY);
  } else {
    throw Error("URLの `state` がセッション `state` と一致しません");
  }

  try {
    const tokensResponse = await fetch(TOKEN_URL, {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: new URL(CALLBACK_REDIRECT_PATH, url.origin).toString(),
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${process.env.DISCORD_CLIENT_ID}:${process.env.DISCORD_CLIENT_SECRET}`)}`,
      },
    }).catch(() => {
      throw Error("Discordトークンの取得に失敗しました。");
    });
    const tokens: Tokens = await tokensResponse.json();

    const userResponse = await fetch(USER_INFO_URL, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const user: DiscordUserInfo = await userResponse.json();

    const userInfo: UserInfo = {
      id: user.id,
      displayName: user.global_name ?? user.username,
      email: user.email,
      photo: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`,
      locale: user.locale,
      accessToken: tokens.access_token,
      refleshToken: tokens.refresh_token,
    };

    await session.set(USER_INFO_KEY, userInfo);

    const account = await prisma.user.findUnique({
      where: {
        originalId: userInfo.id,
      },
      select: {
        id: true,
      },
    });

    // アカウントが存在する場合はトップページにリダイレクト
    if (account !== null) {
      await session.set(USER_ACCOUNT_ID_KEY, account.id);
      const redirectTo: string = session.get(AUTHORIZE_FROM_KEY);

      throw redirect(redirectTo || "/", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    throw redirect(CONNECT_ACCOUNT_PATH, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    // Allow responses to pass-through
    if (error instanceof Response) throw error;
  }

  return null;
};

export type UserData = {
  userInfo: UserInfo;
  userAccountId: string | undefined;
};

export async function isAuthenticated(
  request: Request | Session,
  options?: {
    successRedirect?: never;
    failureRedirect?: never;
  },
): Promise<UserData | null>;
export async function isAuthenticated(
  request: Request | Session,
  options: {
    successRedirect: string;
    failureRedirect?: never;
  },
): Promise<null>;
export async function isAuthenticated(
  request: Request | Session,
  options: {
    successRedirect?: never;
    failureRedirect: string;
  },
): Promise<UserData>;
export async function isAuthenticated(
  request: Request | Session,
  options: {
    successRedirect: string;
    failureRedirect: string;
  },
): Promise<null>;
export async function isAuthenticated(
  request: Request | Session,
  options:
    | {
        successRedirect?: never;
        failureRedirect?: never;
      }
    | {
        successRedirect: string;
        failureRedirect?: never;
      }
    | {
        successRedirect?: never;
        failureRedirect: string;
      }
    | {
        successRedirect: string;
        failureRedirect: string;
      } = {},
): Promise<UserData | null> {
  const session = isSession(request)
    ? request
    : await getSession(request.headers.get("Cookie"));

  const userInfo: UserInfo | null = await session.get(USER_INFO_KEY);
  const userAccountId: string | undefined =
    await session.get(USER_ACCOUNT_ID_KEY);

  if (userInfo !== null) {
    if (options.successRedirect) throw redirect(options.successRedirect);

    return {
      userInfo,
      userAccountId,
    };
  }

  if (options.failureRedirect) throw redirect(options.failureRedirect);
  return null;
}
