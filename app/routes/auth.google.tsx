import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getGoogleAuthUrl } from "../lib/oauth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");

  if (!state) {
    return redirect("/?error=Invalid OAuth state");
  }

  try {
    const authUrl = getGoogleAuthUrl(state);
    return redirect(authUrl);
  } catch (error) {
    console.error("OAuth initiation error:", error);
    return redirect("/?error=Failed to initiate OAuth");
  }
}
