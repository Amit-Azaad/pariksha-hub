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
      <div className="flex flex-col flex-1 w-full px-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Settings</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Manage your app preferences and configuration</p>
        </div>
        
        {/* Settings Sections */}
        <div className="max-w-2xl">
          {/* Appearance Section */}
          <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 8.6 15a1.65 1.65 0 0 0-1.82-.33l-.06-.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 15.4 9a1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06A1.65 1.65 0 0 0 19.4 15z" />
                </svg>
                Appearance
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[var(--color-text-primary)] font-medium">Theme</span>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    Choose between light and dark appearance
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--color-text-secondary)] px-3 py-1 bg-[var(--color-bg-muted)] rounded-full">
                    {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>




        </div>
      </div>
    </div>
  );
} 