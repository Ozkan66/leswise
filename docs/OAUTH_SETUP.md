# OAuth Authentication Setup

This guide helps you configure Google and Microsoft OAuth authentication for Leswise.

## Overview

Leswise supports authentication via:
- Email and password
- Google OAuth
- Microsoft OAuth (Azure)

## Supabase OAuth Configuration

### Prerequisites
1. A Supabase project
2. Google OAuth 2.0 credentials (for Google authentication)
3. Microsoft Azure app registration (for Microsoft authentication)

### Step 1: Configure OAuth Providers in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** > **Providers**

### Step 2: Enable Google Authentication

1. Find **Google** in the providers list
2. Toggle it to **Enabled**
3. Configure the following:
   - **Client ID**: Your Google OAuth 2.0 Client ID
   - **Client Secret**: Your Google OAuth 2.0 Client Secret
4. Add your redirect URLs:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

### Step 3: Enable Microsoft Authentication  

1. Find **Azure** in the providers list
2. Toggle it to **Enabled**
3. Configure the following:
   - **Client ID**: Your Azure app's Application (client) ID
   - **Client Secret**: Your Azure app's client secret value
4. Add your redirect URLs (same as Google)

## Getting OAuth Credentials

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Configure the OAuth consent screen
6. Add authorized redirect URIs:
   - `https://[your-supabase-url]/auth/v1/callback`
7. Copy the Client ID and Client Secret

### Microsoft Azure Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Configure the app:
   - Name: "Leswise"
   - Supported account types: Accounts in any organizational directory and personal Microsoft accounts
   - Redirect URI: `https://[your-supabase-url]/auth/v1/callback`
5. Go to **Certificates & secrets** and create a new client secret
6. Copy the Application (client) ID and client secret value

## Troubleshooting

### "provider is not enabled" Error

This error occurs when OAuth providers are not properly configured in Supabase.

**Solution:**
1. Verify the provider is enabled in Supabase Dashboard
2. Check that OAuth credentials are correctly entered
3. Ensure redirect URLs are properly configured
4. Test the configuration

### Development vs Production

Make sure to:
- Use different OAuth app configurations for development and production
- Update redirect URLs for each environment
- Keep credentials secure and separate

## Testing

To test OAuth authentication:
1. Start your development server
2. Navigate to the registration or login page
3. Click the Google or Microsoft button
4. Complete the OAuth flow
5. Verify successful authentication

If you encounter issues, check the browser console for detailed error messages.