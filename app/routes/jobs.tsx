import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => [{ title: "Jobs | Pariksha Hub" }];

export default function JobsPage() {
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
        <h1 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">Jobs</h1>
        <p className="text-[var(--color-text-secondary)]">Find the latest job opportunities here.</p>
      </div>
    </div>
  );
} 