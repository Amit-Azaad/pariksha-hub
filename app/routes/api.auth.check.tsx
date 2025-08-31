import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { sessionStorage } from "../lib/oauth.server";
import { prisma } from "../lib/prisma.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  console.log("🔍 API Auth Check - Cookie header:", cookieHeader ? "Present" : "Missing");
  
  if (cookieHeader) {
    console.log("🔍 API Auth Check - Cookie content:", cookieHeader);
  }
  
  const session = await sessionStorage.getSession(cookieHeader);
  const userId = session.get("userId");
  
  console.log("🔍 API Auth Check - Session userId:", userId);
  
  let user = null;
  if (userId) {
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
      console.log("🔍 API Auth Check - User found:", user ? { id: user.id, email: user.email } : "null");
    } catch (error) {
      console.error("🔍 API Auth Check - Error getting user:", error);
    }
  }
  
  return json({
    hasCookie: !!cookieHeader,
    hasSession: !!userId,
    userId,
    user: user ? {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    } : null,
  });
}
