import { redirect } from "@remix-run/node";
import { createCookieSessionStorage } from "@remix-run/node";
import { prisma } from "../lib/prisma.server";
import type { User, GoogleOAuthProfile } from "./types";

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5173/auth/callback";

// Session storage for OAuth state and user sessions
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "default-secret"],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    domain: process.env.NODE_ENV === "production" ? undefined : "localhost",
  },
});

// OAuth URLs
export const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

// Helper function to get OAuth credentials
function getOAuthCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured. Please check your .env file.");
  }
  
  return { clientId, clientSecret };
}

// Generate Google OAuth authorization URL
export function getGoogleAuthUrl(state: string): string {
  const { clientId } = getOAuthCredentials();
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    state: state,
    access_type: "offline",
    prompt: "consent",
  });

  return `${GOOGLE_OAUTH_URL}?${params.toString()}`;
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code: string): Promise<string> {
  const { clientId, clientSecret } = getOAuthCredentials();
  
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: GOOGLE_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange code for token");
  }

  const data = await response.json();
  return data.access_token;
}

// Get user profile from Google
export async function getGoogleUserProfile(accessToken: string): Promise<GoogleOAuthProfile> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get user profile");
  }

  return response.json();
}

// Find or create user from Google OAuth profile
export async function findOrCreateUser(profile: GoogleOAuthProfile): Promise<User> {
  // Check if user exists by Google ID
  let user = await prisma.user.findUnique({
    where: { googleId: profile.id },
  });

  if (!user) {
    // Check if user exists by email
    user = await prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (user) {
      // Link existing email account with Google ID
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.id,
          avatar: profile.picture,
          isEmailVerified: profile.verified_email,
          lastLoginAt: new Date(),
        },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          googleId: profile.id,
          avatar: profile.picture,
          isEmailVerified: profile.verified_email,
          role: "USER",
          lastLoginAt: new Date(),
        },
      });
    }
  } else {
    // Update existing user's last login
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        avatar: profile.picture,
        name: profile.name,
      },
    });
  }

  return user as User;
}

// Create user session
export async function createUserSession(userId: number, redirectTo: string) {
  console.log("🔄 Creating session for user ID:", userId);
  
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  
  console.log("🔄 Session created, setting cookie...");
  const cookie = await sessionStorage.commitSession(session);
  console.log("✅ Cookie set:", cookie.substring(0, 50) + "...");
  
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": cookie,
    },
  });
}

// Get user from session
export async function getUserFromSession(request: Request): Promise<User | null> {
  const cookieHeader = request.headers.get("Cookie");
  console.log("🔄 Getting user from session, cookie header:", cookieHeader ? "Present" : "Missing");
  
  if (cookieHeader) {
    console.log("🔍 Cookie header content:", cookieHeader);
    // Check if our session cookie exists
    if (cookieHeader.includes("__session")) {
      console.log("✅ __session cookie found in header");
    } else {
      console.log("❌ __session cookie NOT found in header");
    }
  }
  
  const session = await sessionStorage.getSession(cookieHeader);
  const userId = session.get("userId");
  
  console.log("🔄 Session userId:", userId);
  
  if (!userId) {
    console.log("❌ No userId in session");
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (user) {
      console.log("✅ User found in session:", { id: user.id, email: user.email });
    } else {
      console.log("❌ User not found in database for ID:", userId);
    }
    
    return user as User;
  } catch (error) {
    console.error("❌ Error getting user from session:", error);
    return null;
  }
}

// Require user authentication (redirects to login if not authenticated)
export async function requireUser(request: Request): Promise<User> {
  const user = await getUserFromSession(request);
  if (!user) {
    throw redirect("/auth/login");
  }
  return user;
}

// Require admin role
export async function requireAdmin(request: Request): Promise<User> {
  const user = await requireUser(request);
  if (user.role !== "ADMIN") {
    throw redirect("/");
  }
  return user as User;
}

// Logout user
export async function logout(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

// Generate random state for OAuth security
export function generateOAuthState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
