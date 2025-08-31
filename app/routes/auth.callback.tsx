import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { 
  exchangeCodeForToken, 
  getGoogleUserProfile, 
  findOrCreateUser, 
  createUserSession 
} from "../lib/oauth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  console.log("🔐 OAuth Callback - URL:", request.url);
  console.log("🔐 OAuth Callback - Code:", code ? "Present" : "Missing");
  console.log("🔐 OAuth Callback - State:", state ? "Present" : "Missing");
  console.log("🔐 OAuth Callback - Error:", error || "None");

  if (error) {
    // Handle OAuth errors
    const errorMessage = error === "access_denied" 
      ? "Access was denied. Please try again." 
      : "An error occurred during authentication.";
    
    console.error("❌ OAuth Error:", errorMessage);
    return redirect(`/?error=${encodeURIComponent(errorMessage)}`);
  }

  if (!code || !state) {
    console.error("❌ Missing OAuth parameters - Code:", !!code, "State:", !!state);
    return redirect("/?error=Invalid authentication response");
  }

  try {
    console.log("🔄 Exchanging code for token...");
    // Exchange authorization code for access token
    const accessToken = await exchangeCodeForToken(code);
    console.log("✅ Token received successfully");
    
    console.log("🔄 Getting Google user profile...");
    // Get user profile from Google
    const googleProfile = await getGoogleUserProfile(accessToken);
    console.log("✅ Google profile received:", { 
      id: googleProfile.id, 
      email: googleProfile.email, 
      name: googleProfile.name 
    });
    
    console.log("🔄 Finding or creating user...");
    // Find or create user in our database
    const user = await findOrCreateUser(googleProfile);
    console.log("✅ User found/created:", { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });
    
    console.log("🔄 Creating user session and redirecting...");
    // Create user session and redirect
    return createUserSession(user.id, "/");
  } catch (error) {
    console.error("❌ OAuth callback error:", error);
    return redirect("/?error=Authentication failed. Please try again.");
  }
}
