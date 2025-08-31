import { json } from "@remix-run/node";
import { getUserFromSession, sessionStorage } from "./oauth.server";
import type { User } from "./types";

// Get user from session without throwing errors
export async function getOptionalUser(request: Request): Promise<User | null> {
  try {
    return await getUserFromSession(request);
  } catch {
    return null;
  }
}

// Get user from session and return JSON response for API routes
export async function getAuthUser(request: Request) {
  const user = await getOptionalUser(request);
  return json({ user });
}

// Check if user is authenticated
export async function isAuthenticated(request: Request): Promise<boolean> {
  const user = await getOptionalUser(request);
  return !!user;
}

// Check if user has admin role
export async function isAdmin(request: Request): Promise<boolean> {
  const user = await getOptionalUser(request);
  return user?.role === "ADMIN";
}

// Get user role safely
export async function getUserRole(request: Request): Promise<string | null> {
  const user = await getOptionalUser(request);
  return user?.role || null;
}
