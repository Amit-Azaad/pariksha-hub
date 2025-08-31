import React from 'react';
import GoogleSignIn from './GoogleSignIn';

interface GuestPromptProps {
  className?: string;
  variant?: 'inline' | 'modal' | 'banner';
  onClose?: () => void;
}

export default function GuestPrompt({ 
  className = '', 
  variant = 'inline',
  onClose 
}: GuestPromptProps) {
  const handleSignIn = () => {
    // The GoogleSignIn component will handle the OAuth flow
    // This is just a placeholder for any additional logic
  };

  const baseClasses = 'rounded-lg border border-gray-200 bg-white shadow-sm';
  
  const variantClasses = {
    inline: 'p-4',
    modal: 'p-6 max-w-md mx-auto',
    banner: 'p-4 border-l-4 border-blue-500'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mt-4">
              Sign in to save your progress
            </h3>
            <div className="mt-2 px-7 py-3">
              <p className="text-sm text-gray-500">
                Create an account or sign in to save your quiz progress, view detailed analytics, and access more features.
              </p>
            </div>
            <div className="items-center px-4 py-3">
              <GoogleSignIn 
                variant="default" 
                size="lg" 
                className="w-full"
              >
                Continue with Google
              </GoogleSignIn>
              <button
                onClick={onClose}
                className="mt-3 w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={classes}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Sign in</span> to save your progress and get detailed analytics
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <GoogleSignIn variant="outline" size="sm">
              Sign in
            </GoogleSignIn>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default inline variant
  return (
    <div className={classes}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Sign in to unlock more features
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Create an account or sign in to save your quiz progress, view detailed analytics, and access personalized content.
        </p>
        <GoogleSignIn variant="default" size="md">
          Sign in with Google
        </GoogleSignIn>
        <p className="text-xs text-gray-400 mt-3">
          Your progress will be saved automatically
        </p>
      </div>
    </div>
  );
}
