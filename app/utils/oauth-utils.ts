// OAuth utility functions for client-side use

// Generate OAuth state for security
export function generateOAuthState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Store OAuth state in localStorage for verification
export function storeOAuthState(state: string): void {
  localStorage.setItem('oauth_state', state);
}

// Get stored OAuth state
export function getStoredOAuthState(): string | null {
  return localStorage.getItem('oauth_state');
}

// Clear stored OAuth state
export function clearOAuthState(): void {
  localStorage.removeItem('oauth_state');
}

// Initiate Google OAuth flow
export function initiateGoogleSignIn(): void {
  const state = generateOAuthState();
  storeOAuthState(state);
  
  // Redirect to the OAuth route
  window.location.href = `/auth/google?state=${state}`;
}

// Check if OAuth state is valid
export function isOAuthStateValid(state: string): boolean {
  const storedState = getStoredOAuthState();
  return storedState === state;
}

// Handle OAuth callback parameters
export function handleOAuthCallback(): { code: string; state: string } | null {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');

  if (error) {
    console.error('OAuth error:', error);
    return null;
  }

  if (!code || !state) {
    console.error('Missing OAuth parameters');
    return null;
  }

  // Verify state parameter
  if (!isOAuthStateValid(state)) {
    console.error('Invalid OAuth state');
    return null;
  }

  // Clear the state after verification
  clearOAuthState();

  return { code, state };
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  // This will be implemented with session cookies
  // For now, we'll check if there's a user session
  return document.cookie.includes('__session');
}

// Get user profile from session
export async function getUserProfile(): Promise<any> {
  try {
    const response = await fetch('/api/auth/profile', {
      credentials: 'include',
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Sign out user
export async function signOut(): Promise<void> {
  try {
    await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    
    // Redirect to home page
    window.location.href = '/';
  } catch (error) {
    console.error('Error signing out:', error);
    // Force redirect even if API call fails
    window.location.href = '/';
  }
}

// Check if user has admin role
export async function isAdmin(): Promise<boolean> {
  try {
    const profile = await getUserProfile();
    return profile?.role === 'ADMIN';
  } catch {
    return false;
  }
}

// OAuth error handling
export function handleOAuthError(error: string): string {
  const errorMessages: Record<string, string> = {
    'access_denied': 'Access was denied. Please try again.',
    'invalid_request': 'Invalid request. Please try again.',
    'unauthorized_client': 'Unauthorized client. Please contact support.',
    'unsupported_response_type': 'Unsupported response type. Please contact support.',
    'invalid_scope': 'Invalid scope requested. Please contact support.',
    'server_error': 'Server error. Please try again later.',
    'temporarily_unavailable': 'Service temporarily unavailable. Please try again later.',
  };

  return errorMessages[error] || 'An unexpected error occurred. Please try again.';
}
