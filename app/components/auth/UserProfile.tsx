import React, { useState } from 'react';
import { signOut } from '../../utils/oauth-utils';

interface UserProfileProps {
  user: {
    id: number;
    name: string | null;
    email: string;
    avatar: string | null;
    role: string;
  };
  className?: string;
}

export default function UserProfile({ user, className = '' }: UserProfileProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <div className="flex items-center space-x-3">
          {user.avatar ? (
            <img
              className="h-8 w-8 rounded-full"
              src={user.avatar}
              alt={user.name || user.email}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-700">
              {user.name || 'User'}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
              <p className="font-medium">{user.name || 'User'}</p>
              <p className="text-gray-500">{user.email}</p>
              <p className="text-xs text-blue-600 font-medium mt-1">
                {user.role === 'ADMIN' ? 'Administrator' : 'User'}
              </p>
            </div>
            
            <a
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Profile Settings
            </a>
            
            {user.role === 'ADMIN' && (
              <a
                href="/admin"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Admin Dashboard
              </a>
            )}
            
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
