import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/auth.server";

export function loader({ request }: LoaderFunctionArgs) {
  return authenticate(request);
}
