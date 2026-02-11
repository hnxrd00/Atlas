# Setup Guide for Supabase Authentication

## 1. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project or create a new one
3. Go to **Settings > API** (in the left sidebar)
4. Copy your **Project URL** and **anon (public) key**
5. Update these in `auth.js`:
   ```javascript
   const SUPABASE_URL = 'https://kdepevrkbejbprlzkcij.supabase.co';
   const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // Replace this
   ```

## 2. Create Users Table in Supabase

In Supabase, go to **SQL Editor** and run this query:

```sql
-- Create public.users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create policy to allow users to insert their own data
CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## 3. Setup Google OAuth (FREE - No Payment Required)

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a Project** (top-left dropdown)
3. Click **NEW PROJECT**
4. Name it `Atlas` (or any name)
5. Click **CREATE** and wait for it to be created
6. Once created, it should be automatically selected

### Step 2: Enable Google+ API

1. In Google Cloud Console, search for **Google+ API** (search bar at top)
2. Click on **Google+ API**
3. Click **ENABLE** (this is free - no payment needed)

### Step 3: Create OAuth 2.0 Credentials

1. In Google Cloud Console, go to **Credentials** (left sidebar)
2. Click **+ CREATE CREDENTIALS** (top)
3. Select **OAuth 2.0 Client ID**
4. If prompted, click **Configure Consent Screen** first:
   - Select **External** for User Type
   - Click **CREATE**
   - Fill in:
     - **App name**: Atlas
     - **User support email**: Your email
     - **Developer contact**: Your email
   - Click **SAVE AND CONTINUE** through all sections
   - Click **BACK TO CREDENTIALS** when done

5. Now click **+ CREATE CREDENTIALS** again → **OAuth 2.0 Client ID**
6. For **Application type**, select **Web application**
7. Name it `Atlas Web Client`
8. Under **Authorized JavaScript origins**, click **+ ADD URI**:
   - Add: `http://localhost:5500`
   - Add: `http://127.0.0.1:5500`
9. Under **Authorized redirect URIs**, click **+ ADD URI**:
   - Add: `https://kdepevrkbejbprlzkcij.supabase.co/auth/v1/callback`
   (This is your Supabase project URL + callback path)
10. Click **CREATE**
11. Copy your **Client ID** and **Client Secret** (you'll need these)

### Step 4: Add Google Credentials to Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your Atlas project
3. Go to **Authentication > Providers** (left sidebar)
4. Find and click on **Google**
5. Paste your **Client ID** and **Client Secret** from Google Cloud
6. Under **Redirect URL**, add:
   ```
   http://localhost:5500/signup.html
   http://localhost:5500/get-started.html
   ```
7. Click **SAVE**

### Step 5: Test Locally

Run your dev server:
```bash
npm run dev
# or if using Five Server, just open http://localhost:5500
```

Go to `http://localhost:5500/signup.html` and test the **"Sign up with Google"** button - it should work!

### What If It Doesn't Work?

- **"popup_closed_by_user"**: Normal - just click the button again
- **Redirect URI mismatch**: Make sure your localhost URL matches EXACTLY in Google Cloud (including the path)
- **Blank popup or error**: Check that Google+ API is ENABLED (step 2)

### After Development - For Production

When you deploy to a real domain:
1. Add your real domain to Google Cloud credentials:
   - **Authorized JavaScript origins**: `https://yourdomain.com`
   - **Authorized redirect URIs**: `https://yourdomain.com/auth/v1/callback`
2. Update in Supabase too

---

## 4. File Structure

- **auth.js** - Handles signup, login, and Google OAuth
- **signup.html** - Signup page with email/password and Google option
- **get-started.html** - Login page
- **dashboard.html** - User dashboard (create after login is working)

## 5. Test the Flow

1. Start your dev server (Five Server or `npm run dev`)
2. Go to `http://localhost:5500/signup.html` and create an account
3. You should see user data in Supabase > Users table
4. Test Google sign-up after completing Step 4 of the Google OAuth setup

## 6. Next Steps

- Create a `dashboard.html` page for authenticated users
- Create a login session management system
- Implement logout functionality
- Add password reset feature

## Troubleshooting

- **"SUPABASE_ANON_KEY is undefined"**: Make sure you added your actual anon key to `auth.js`
- **Google OAuth popup doesn't open**: Check browser console (F12 > Console) for errors
- **"Redirect URI mismatch"**: Ensure the redirect URL in Google Cloud matches EXACTLY
- **Google+ API not enabled**: Go back to Step 2 and enable it
- **User table errors**: Make sure SQL migration ran and RLS policies are enabled

- **Google OAuth not working**: Check that redirect URLs are correctly configured in both Google Cloud Console and Supabase
- **User table errors**: Make sure the SQL migration ran successfully and RLS policies are enabled
