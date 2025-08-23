import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  useLocation,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import tailwindStylesheetUrl from "./styles/tailwind.css?url";
import { ThemeProvider } from "./hooks/useTheme";

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
  { rel: "stylesheet", href: "./styles/theme.css" },
  { rel: "manifest", href: "/manifest.json" },
  { rel: "icon", href: "/favicon.ico" },
  { rel: "apple-touch-icon", href: "/logo-light.png" },
];

export function meta() {
  return [
    { title: "Exam Prep Platform" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { name: "theme-color", content: "#2563eb" },
    { name: "description", content: "A PWA for exam aspirants to prepare for competitive exams." },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
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
        {/* Bottom Navigation (global) */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-bottom-nav)] border-t border-[var(--color-border)] flex justify-around items-center h-16 z-50">
          <NavItem icon={HomeIcon} label="Home" to="/" active={location.pathname === "/"} />
          <NavItem icon={JobsIcon} label="Jobs" to="/jobs" active={location.pathname === "/jobs"} />
          <NavItem icon={QuizIcon} label="Quiz" to="/quiz" active={location.pathname === "/quiz"} />
          <NavItem icon={PYQIcon} label="PYQ's" to="/pyq" active={location.pathname === "/pyq"} />
          <NavItem icon={CAIcon} label="CA" to="/ca" active={location.pathname === "/ca"} />
        </nav>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}

function NavItem({ icon: Icon, label, to, active }: { icon: any; label: string; to: string; active?: boolean }) {
  return (
    <Link to={to} prefetch="intent" className={`flex flex-col items-center text-xs ${active ? "text-[var(--color-accent-primary)]" : "text-[var(--color-text-secondary)]"}`}>
      <Icon className="w-6 h-6 mb-1" />
      {label}
    </Link>
  );
}
function HomeIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 12L12 5l8 7" />
      <rect x="6" y="12" width="12" height="7" rx="2" />
    </svg>
  );
}
function JobsIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}
function NotificationsIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V4a2 2 0 1 0-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
    </svg>
  );
}

function QuizIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 12l2 2 4-4" />
      <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z" />
      <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z" />
      <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z" />
      <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z" />
    </svg>
  );
}

function PYQIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  );
}

function CAIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l6 6v8a2 2 0 0 1-2 2z" />
      <polyline points="17,2 17,8 23,8" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

