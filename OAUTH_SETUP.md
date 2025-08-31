# Google OAuth Setup Guide

## Prerequisites
- Google Cloud Platform account
- Remix application running on localhost:3000 (for development)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API

## Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Pariksha Hub"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
5. Add test users (your email for development)

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the following:
   - Name: "Pariksha Hub Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)

## Step 4: Environment Variables

Create a `.env` file in your project root with:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# Session Security
SESSION_SECRET="your-super-secret-session-key-here"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/auth/callback"

# Environment
NODE_ENV="development"
```

## Step 5: Generate Session Secret

Generate a secure session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 6: Test OAuth Flow

1. Start your development server
2. Navigate to your app
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. Verify user creation in your database

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Ensure the redirect URI in your .env matches exactly what's configured in Google Console
   - Check for trailing slashes or protocol mismatches

2. **"invalid_client" error**
   - Verify your CLIENT_ID and CLIENT_SECRET are correct
   - Ensure the credentials are for a "Web application" type

3. **"access_denied" error**
   - Check if your app is still in testing mode
   - Verify the user's email is added to test users

4. **Session not persisting**
   - Ensure SESSION_SECRET is set
   - Check that cookies are enabled in your browser

### Development vs Production

- **Development**: Use `http://localhost:3000` for origins and redirects
- **Production**: Use your actual domain with `https://` protocol
- **Testing**: Add test user emails to the OAuth consent screen

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique session secrets
- Regularly rotate your OAuth client secrets
- Monitor OAuth usage in Google Cloud Console
- Implement rate limiting for OAuth endpoints in production

## Next Steps

After OAuth is working:

1. Test user creation and login
2. Verify session persistence
3. Test protected routes
4. Implement admin role assignment
5. Add guest user functionality
