# Deployment Guide

This guide will walk you through deploying your Fitness Tracker app to Vercel and Supabase.

## Prerequisites

- GitHub account
- Vercel account (free at [vercel.com](https://vercel.com))
- Supabase account (free at [supabase.com](https://supabase.com))

## Step 1: Set up Supabase

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `fitness-tracker` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Choose closest to your users
5. Click "Create new project"

### 2. Set up Database Schema

1. In your Supabase dashboard, go to "SQL Editor"
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL commands
4. Verify the table and policies were created in "Table Editor"

### 3. Get API Keys

1. Go to "Settings" → "API"
2. Copy the following values:
   - Project URL
   - anon/public key

## Step 2: Set up Environment Variables

### Local Development

1. Create a `.env` file in your project root:
```env
PUBLIC_SUPABASE_URL=your_project_url_here
PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Replace the values with your actual Supabase credentials

### Vercel Deployment

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. In the project settings, go to "Environment Variables"
5. Add the same variables as above:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Deploy to Vercel

### Automatic Deployment

1. Push your code to GitHub
2. Vercel will automatically detect it's an Astro project
3. Click "Deploy"
4. Your app will be live at `https://your-project.vercel.app`

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts
```

## Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Create a new account
3. Add some test entries
4. Verify everything works

## Step 5: PWA Installation

### On Desktop

1. Open your app in Chrome/Edge
2. Look for the install icon in the address bar
3. Click "Install"

### On iPhone

1. Open your app in Safari
2. Tap the share button
3. Tap "Add to Home Screen"

## Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check your Supabase URL and API key
   - Verify RLS policies are set up correctly

2. **Database errors**
   - Run the schema SQL again
   - Check Supabase logs

3. **PWA not installing**
   - Verify manifest.json is accessible
   - Check service worker registration

### Environment Variables

Make sure your environment variables are:
- Prefixed with `PUBLIC_` for client-side access
- Set correctly in Vercel dashboard
- Not committed to Git (use `.env.local` for local development)

## Monitoring

### Vercel Analytics

1. Go to your Vercel dashboard
2. Click "Analytics" tab
3. Monitor performance and usage

### Supabase Monitoring

1. Go to your Supabase dashboard
2. Check "Logs" for any errors
3. Monitor database usage in "Usage" tab

## Next Steps

- Set up custom domain
- Configure email templates in Supabase
- Add Apple ID login
- Set up monitoring and alerts
