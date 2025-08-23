import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { ThemeToggle } from "../components/ThemeToggle";
import { useTheme } from "../hooks/useTheme";

export const meta: MetaFunction = () => [{ title: "Settings | Pariksha Hub" }];

export default function SettingsPage() {
  const { theme } = useTheme();
  
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg-primary)]">
      {/* Back Navigation */}
      <div className="px-6 py-4">
        <Link 
          to="/" 
          className="inline-flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>
      
      {/* Page Content */}
      <div className="flex flex-col items-center justify-center flex-1">
        <h1 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">Settings</h1>
        <p className="text-[var(--color-text-secondary)]">Manage your app settings here.</p>
        
        {/* Theme Settings */}
        <div className="mt-8 p-6 bg-[var(--color-card)] rounded-lg border border-[var(--color-border)]">
          <h2 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]">Appearance</h2>
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-primary)]">Theme</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--color-text-secondary)]">
                {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 