import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUser } from "../lib/oauth.server";
import type { User } from "../lib/types";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  return json({ user });
}

export default function ProfilePage() {
  const { user } = useLoaderData<{ user: User }>();

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Back Navigation */}
      <div className="px-6 py-4">
        <Link 
          to="/settings" 
          className="inline-flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to Settings
        </Link>
      </div>
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-[var(--color-card)] shadow rounded-lg border border-[var(--color-border)]">
          {/* Header */}
          <div className="px-4 py-5 sm:px-6 border-b border-[var(--color-border)]">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Profile</h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Manage your account information and preferences
            </p>
          </div>

          {/* Profile Content */}
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Profile Picture */}
              <div className="sm:col-span-2">
                <div className="flex items-center space-x-6">
                  {user.avatar ? (
                    <img
                      className="h-20 w-20 rounded-full"
                      src={user.avatar}
                      alt={user.name || user.email}
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-2xl font-medium">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                      {user.name || 'User'}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">{user.email}</p>
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      {user.role === 'ADMIN' ? 'Administrator' : 'User'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  Full Name
                </label>
                <p className="mt-1 text-sm text-[var(--color-text-primary)]">
                  {user.name || 'Not provided'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  Email Address
                </label>
                <p className="mt-1 text-sm text-[var(--color-text-primary)]">{user.email}</p>
                {user.isEmailVerified && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                    Verified
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  Account Type
                </label>
                <p className="mt-1 text-sm text-[var(--color-text-primary)] capitalize">
                  {user.role.toLowerCase()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  Member Since
                </label>
                <p className="mt-1 text-sm text-[var(--color-text-primary)]">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  Last Login
                </label>
                <p className="mt-1 text-sm text-[var(--color-text-primary)]">
                  {user.lastLoginAt 
                    ? new Date(user.lastLoginAt).toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  Authentication Method
                </label>
                <p className="mt-1 text-sm text-[var(--color-text-primary)]">
                  Google OAuth
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-medium text-[var(--color-text-primary)]">Account Actions</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Manage your account settings and preferences
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-[var(--color-border)] shadow-sm text-sm font-medium rounded-md text-[var(--color-text-primary)] bg-[var(--color-card)] hover:bg-[var(--color-interactive-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
