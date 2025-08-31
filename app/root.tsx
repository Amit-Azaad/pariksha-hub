import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { useEffect } from "react";
import tailwindStylesheetUrl from "./styles/tailwind.css?url";
import { ThemeProvider } from "./hooks/useTheme";
import AppLayout from "./components/AppLayout";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: tailwindStylesheetUrl },
  { rel: "stylesheet", href: "/styles/theme.css" },
  { rel: "manifest", href: "/manifest.json" },
  { rel: "icon", href: "/favicon.ico" },
  { rel: "apple-touch-icon", href: "/logo-light.png" },
];

export function meta() {
  return [
    { title: "Exam Prep Platform" },
    { name: "viewport", content: "width=device-width, initial-scale=1, user-scalable=no" },
    { name: "theme-color", content: "#2563eb" },
    { name: "description", content: "A PWA for exam aspirants to prepare for competitive exams." },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    { name: "apple-mobile-web-app-title", content: "Exam Prep" },
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "msapplication-TileColor", content: "#2563eb" },
    { name: "msapplication-config", content: "/browserconfig.xml" },
    { name: "application-name", content: "Exam Prep Platform" },
    { name: "msapplication-TileImage", content: "/logo-light.png" },
    { name: "msapplication-square150x150logo", content: "/logo-light.png" },
    { name: "msapplication-wide310x150logo", content: "/logo-light.png" },
    { name: "msapplication-square310x310logo", content: "/logo-light.png" },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  // Register service worker for PWA functionality
  useEffect(() => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const registerSW = async () => {
          try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker registered successfully:', registration);
            
            // Check if there's an update available
            registration.addEventListener('updatefound', () => {
              console.log('Service Worker update found');
            });
          } catch (registrationError) {
            console.error('Service Worker registration failed:', registrationError);
          }
        };

        // Register immediately if page is already loaded
        if (document.readyState === 'complete') {
          registerSW();
        } else {
          window.addEventListener('load', registerSW);
        }
      } else {
        console.log('Service Worker not supported');
      }
    }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </ThemeProvider>
  );
}

// Error boundary to catch loader failures
export function ErrorBoundary() {
  return (
    <html>
      <head>
        <title>Error</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
        <Scripts />
      </body>
    </html>
  );
}



