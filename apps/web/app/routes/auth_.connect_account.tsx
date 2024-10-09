import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { isAuthenticated } from "~/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { userInfo, userAccountId } = await isAuthenticated(request, {
    failureRedirect: "/",
  });

  if (userAccountId !== undefined) throw redirect("/");

  return {
    userInfo,
  };
};

export default function AuthConnectAccount() {
  const { userInfo } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <h2 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
          アカウント連携
        </h2>
        <p>
          サービスアカウントが発行されていません。
          <br />
          このDiscordアカウントでサービスアカウントを発行します。よろしいですか？
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <img
          className="w-40 h-auto rounded-full"
          src={userInfo.photo || "https://placehold.jp/150x150.png"}
          alt=""
          width={150}
          height={150}
        />
        <p>{userInfo.displayName}</p>
      </div>
    </div>
  );
}
