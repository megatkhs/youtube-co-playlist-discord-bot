import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { isAuthenticated } from "~/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userData = await isAuthenticated(request);

  console.log(userData);

  return { userData };
};

export default function Index() {
  const { userData } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            共有プレイリスト作成ボット Webダッシュボード
          </h1>

          {userData === null ? (
            <Link to="/auth">Discordアカウントでログイン</Link>
          ) : (
            <Link to="/signout">ログアウト</Link>
          )}
        </header>
      </div>
    </div>
  );
}
