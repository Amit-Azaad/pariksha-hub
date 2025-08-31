import React from 'react';
import { useLoaderData } from '@remix-run/react';
import GoogleSignIn from './GoogleSignIn';
import GuestPrompt from './GuestPrompt';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
  showGuestPrompt?: boolean;
  className?: string;
}

export default function AuthGuard({ 
  children, 
  requireAuth = false,
  requireAdmin = false,
  fallback,
  showGuestPrompt = false,
  className = ''
}: AuthGuardProps) {
  // This will be populated by the loader data from the route
  const loaderData = useLoaderData<{ user?: any }>();
  const user = loaderData?.user;

  // If no authentication is required, render children
  if (!requireAuth && !requireAdmin) {
    return (
      <div className={className}>
        {children}
        {showGuestPrompt && !user && (
          <GuestPrompt variant="banner" className="mt-4" />
        )}
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h2 className="mt-4 text-lg font-medium text-gray-900">
              Authentication Required
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Please sign in to access this feature.
            </p>
          </div>
          
          <GoogleSignIn variant="default" size="lg" className="w-full">
            Sign in with Google
          </GoogleSignIn>
          
          <p className="mt-4 text-xs text-gray-400">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    );
  }

  // If admin role is required but user is not admin
  if (requireAdmin && user?.role !== 'ADMIN') {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h2 className="mt-4 text-lg font-medium text-gray-900">
              Access Denied
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              You don't have permission to access this feature. Admin access is required.
            </p>
          </div>
          
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  // User is authenticated and has required permissions
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    fallback?: React.ReactNode;
  } = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}
