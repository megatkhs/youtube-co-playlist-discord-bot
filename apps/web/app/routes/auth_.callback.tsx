import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/auth.server";

export function loader({ request }: LoaderFunctionArgs) {
  return authenticate(request);
}

export default function AuthCallback() {
  return (
    <div>
      <h1>AuthCallback</h1>
    </div>
  );
}
