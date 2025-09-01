import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  // Handle Chrome DevTools requests
  if (url.pathname.includes('.well-known') || url.pathname.includes('devtools')) {
    return json({ message: "Not found" }, { status: 404 });
  }
  
  // Don't handle quiz routes - let them be handled by their specific routes
  if (url.pathname.startsWith('/quiz/')) {
    throw new Response("Not Found", { status: 404 });
  }
  
  // Handle other unmatched routes
  return json({ message: "Page not found" }, { status: 404 });
}

export default function CatchAll() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600">The page you're looking for doesn't exist.</p>
    </div>
  );
} 