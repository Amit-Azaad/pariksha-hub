import React from "react";
import { useLocation, Link } from "@remix-run/react";
import PWAInstallButton from "./PWAInstallButton";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <>
      {children}
      
      {/* PWA Install Button */}
      <PWAInstallButton />
      
      {/* Bottom Navigation (global) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-bottom-nav)] border-t border-[var(--color-border)] flex justify-around items-center h-16 z-50">
        <NavItem icon={HomeIcon} label="Home" to="/" active={location.pathname === "/"} />
        <NavItem icon={JobsIcon} label="Jobs" to="/jobs" active={location.pathname === "/jobs"} />
        <NavItem icon={QuizIcon} label="Quiz" to="/quiz" active={location.pathname === "/quiz"} />
        <NavItem icon={PYQIcon} label="PYQ's" to="/pyq" active={location.pathname === "/pyq"} />
        <NavItem icon={CAIcon} label="CA" to="/ca" active={location.pathname === "/ca"} />
      </nav>
    </>
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
