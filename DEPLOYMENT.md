# Deployment Guide

This document describes how to deploy the Leswise application using the automated CI/CD pipeline.

## Overview

The Leswise project uses GitHub Actions for continuous integration and deployment. The pipeline automatically:

- Runs linting, testing, and building on every push and pull request
- Deploys to production (Vercel) when code is merged to the `main` branch
- Uses environment variables for secure configuration management

## Prerequisites

### 1. Vercel Account Setup
- Create a [Vercel](https://vercel.com) account
- Connect your GitHub repository to Vercel
- Note down your Vercel project settings

### 2. Supabase Setup
- Set up your [Supabase](https://supabase.com) project
- Get your project URL and anon key from the Supabase dashboard

#### OAuth Providers Configuration
To enable Google and Microsoft authentication:

1. **Navigate to Authentication > Providers** in your Supabase dashboard
2. **Enable Google Provider:**
   - Toggle the Google provider to "Enabled"
   - Add your Google OAuth 2.0 credentials (Client ID and Client Secret)
   - Configure authorized redirect URIs to include your domain(s)
3. **Enable Azure/Microsoft Provider:**
   - Toggle the Azure provider to "Enabled" 
   - Add your Microsoft OAuth 2.0 credentials
   - Configure redirect URIs appropriately
4. **Add redirect URLs** for both development and production:
   - `http://localhost:3000` (for local development)
   - `https://yourdomain.com` (for production)

**Note:** If OAuth providers are not properly configured, users will see a "provider is not enabled" error when attempting to sign in with Google or Microsoft.

## Environment Variables

### Required GitHub Secrets

Configure these secrets in your GitHub repository settings (`Settings` > `Secrets and variables` > `Actions`):

| Secret Name | Description | Where to find |
|-------------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Supabase Dashboard > Settings > API |
| `VERCEL_TOKEN` | Vercel deployment token | Vercel Dashboard > Settings > Tokens |

### Local Development

Create a `.env.local` file in the `web/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## CI/CD Pipeline

### Workflow Triggers

The pipeline runs on:
- **Pull Requests**: Runs tests and builds to verify changes
- **Push to main**: Runs full pipeline including deployment

### Pipeline Stages

1. **Build and Test**
   - Checkout code
   - Install dependencies
   - Run ESLint (non-blocking for now due to existing TypeScript issues)
   - Run Jest tests
   - Build application

2. **Deploy** (main branch only)
   - Build production version
   - Deploy to Vercel

### Build Configuration

The project includes special build configurations for CI:

- `npm run build:ci`: Builds with TypeScript error tolerance for CI environments
- `npm run lint`: Standard linting (may fail with current TypeScript issues)
- `npm run test`: Runs Jest test suite

## Manual Deployment

### Local Build Testing

```bash
cd web
npm ci
npm run test
npm run build:ci
```

### Manual Vercel Deployment

If you need to deploy manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd web
vercel --prod
```

## Monitoring and Rollbacks

### Vercel Dashboard
- Monitor deployments at [vercel.com/dashboard](https://vercel.com/dashboard)
- View build logs and runtime errors
- Quick rollback to previous deployments

### GitHub Actions
- Monitor pipeline status in the Actions tab
- View detailed logs for debugging
- Failed deployments will not affect production

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set correctly
   - Verify Supabase connectivity
   - Review build logs in GitHub Actions

2. **Test Failures**
   - Run tests locally: `npm run test`
   - Check Jest configuration in `jest.config.js`

3. **Deployment Issues**
   - Verify Vercel token permissions
   - Check Vercel project configuration
   - Review deployment logs in Vercel dashboard

4. **OAuth Authentication Issues**
   - **Error: "provider is not enabled"**
     - Solution: Enable the OAuth provider in Supabase Dashboard > Authentication > Providers
     - Ensure Google/Microsoft OAuth credentials are properly configured
     - Verify redirect URLs include your application domains
   - **OAuth redirect fails**
     - Check that redirect URLs are correctly configured in both Supabase and the OAuth provider
     - Ensure HTTPS is used for production URLs
     - Verify domain matches exactly (no trailing slashes, correct subdomain)

### Getting Help

1. Check the GitHub Actions logs for detailed error messages
2. Review Vercel deployment logs
3. Verify all required secrets are configured
4. Ensure Supabase project is accessible

## Future Improvements

- [ ] Add staging environment for testing before production
- [ ] Implement proper TypeScript types to eliminate build warnings
- [ ] Add performance monitoring and analytics
- [ ] Set up automated database migrations with Supabase CLI
- [ ] Add security scanning and dependency updates

## Configuration Files

- `.github/workflows/ci-cd.yml`: Main CI/CD pipeline
- `web/next.config.ts`: Next.js build configuration
- `web/jest.config.js`: Test configuration
- `web/package.json`: Build scripts and dependencies