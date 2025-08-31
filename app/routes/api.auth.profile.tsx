import type { LoaderFunctionArgs } from "@remix-run/node";
import { getAuthUser } from "../lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return getAuthUser(request);
}
