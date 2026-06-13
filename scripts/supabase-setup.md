# Supabase Setup Guide — HR Cost Intelligence

This guide walks through configuring Supabase Authentication with TOTP Multi-Factor Authentication for the CostIQ platform.

---

## Table of Contents

1. [Create a Supabase Project](#1-create-a-supabase-project)
2. [Get API Credentials](#2-get-api-credentials)
3. [Configure Environment Variables](#3-configure-environment-variables)
4. [Enable MFA in Dashboard](#4-enable-mfa-in-dashboard)
5. [Set Up Row-Level Security (RLS) Policies](#5-set-up-row-level-security-rls-policies)
6. [Configure Authentication Settings](#6-configure-authentication-settings)
7. [Test the Auth Flow](#7-test-the-auth-flow)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Create a Supabase Project

1. Go to **[supabase.com](https://supabase.com)** and sign in (or create an account).
2. Click **"New project"**.
3. Fill in the details:
   - **Name:** `hr-cost-intelligence` (or your preferred name)
   - **Database Password:** Generate a strong password and save it securely
   - **Region:** Choose the closest to your users
4. Click **"Create new project"** and wait ~2 minutes for provisioning.

---

## 2. Get API Credentials

1. In your project dashboard, go to **Project Settings** → **API** (in the left sidebar).
2. Under **"Project URL"**, copy the URL (looks like `https://xxxxxxxxxxxx.supabase.co`).
3. Under **"Project API keys"**, copy the **`anon` public key** (starts with `eyJ...`).
4. Save both values — you'll need them for the `.env` file.

---

## 3. Configure Environment Variables

1. In the project root, **copy the template**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`** and fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. (Optional) Add your Anthropic API key for AI attribution features:
   ```env
   VITE_ANTHROPIC_API_KEY=sk-ant-...
   ```

4. **Important:** The `.env` file is already in `.gitignore` — your secrets will never be committed.

---

## 4. Enable MFA in Dashboard

MFA is **enabled by default** on all Supabase projects. However, verify the settings:

1. Go to **Authentication** → **Providers** in your Supabase dashboard.
2. Under **"Auth providers"**, ensure **Email** is enabled (it's on by default).
3. Scroll down to **"MFA Settings"** (may appear under a collapsible section):
   - **MFA Enrollment:** Should be set to **"Optional"** or **"Required"**.
     - `Optional` — users can choose to enable MFA (recommended for this app).
     - `Required` — all users must enroll in MFA.
   - **MFA Verification:** Should **not** be set to `Disabled`. Keep it enabled.
4. Click **"Save"** if you made changes.

---

## 5. Set Up Row-Level Security (RLS) Policies

To enforce MFA at the **database level** (prevent API access without MFA), you need to configure RLS policies. This is optional but **strongly recommended** for production.

### Step 5.1: Enable RLS on Relevant Tables

1. Go to **SQL Editor** in your Supabase dashboard.
2. Run the following SQL to enable RLS on your tables (adjust table names as needed):

   ```sql
   -- Enable RLS on key tables
   ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE IF EXISTS public.meetings ENABLE ROW LEVEL SECURITY;
   ALTER TABLE IF EXISTS public.attributions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
   ```

### Step 5.2: Add MFA Enforcement Policies

Run these SQL policies to restrict access to users who have completed MFA (AAL2):

```sql
-- Restrictive MFA policy: blocks users who haven't completed MFA
-- Apply this to any table containing sensitive data

CREATE POLICY "MFA required for profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO authenticated
USING ((SELECT auth.jwt() ->> 'aal') = 'aal2');

CREATE POLICY "MFA required for meetings"
ON public.meetings
AS RESTRICTIVE
FOR ALL
TO authenticated
USING ((SELECT auth.jwt() ->> 'aal') = 'aal2');

CREATE POLICY "MFA required for attributions"
ON public.attributions
AS RESTRICTIVE
FOR ALL
TO authenticated
USING ((SELECT auth.jwt() ->> 'aal') = 'aal2');

CREATE POLICY "MFA required for projects"
ON public.projects
AS RESTRICTIVE
FOR ALL
TO authenticated
USING ((SELECT auth.jwt() ->> 'aal') = 'aal2');
```

> **Note:** `AS RESTRICTIVE` means this policy is applied *in addition* to any permissive policies. If the JWT doesn't contain `aal2`, access is denied regardless of other policies.

### Step 5.3: Add Basic CRUD Policies

Add permissive policies for authenticated users (these work together with the restrictive MFA policies above):

```sql
-- Example: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = id);

-- Example: All authenticated users can read projects
CREATE POLICY "Authenticated users can read projects"
ON public.projects
FOR SELECT
TO authenticated
USING (true);
```

---

## 6. Configure Authentication Settings

### Session Settings

1. Go to **Authentication** → **Settings** in your Supabase dashboard.
2. Under **"Session"**, configure:
   - **Session duration:** `86400` (24 hours in seconds) — matches the app's session timeout
   - **Refresh token reuse interval:** `10` seconds
   - **Enable PKCE flow:** ✅ Enabled (matches the app's `flowType: 'pkce'`)

### User Signups

1. Under **"General"**, ensure:
   - **Confirm email:** — **For development, set to `Disabled`** to skip email verification. If enabled, users must check their email and click a confirmation link before they can sign in.
     > ⚠️ **Recommended for development:** Disable email confirmation to test the full auth flow (signup → MFA setup → dashboard) without needing an SMTP provider.
   - **Confirm phone:** `Disabled` (unless you use phone auth)
   - **Allow new users to sign up:** `Enabled`

> **To disable email confirmation:**
> 1. Go to **Authentication → Settings** in the Supabase dashboard
> 2. Scroll to **"User Signups"** section
> 3. Set **"Confirm email"** to `Disabled`
> 4. Click **"Save"**
> 5. **Important:** Delete the existing test user from **Authentication → Users** and sign up again (the old user was created with the email-unconfirmed flag)

### User Metadata Fields

The app stores custom user metadata during signup. No additional Supabase config is needed — the SDK handles this automatically:

```typescript
// These fields are stored in auth.users.raw_user_meta_data
{
  "name": "Jane Smith",
  "role": "admin" | "finance" | "manager" | "employee",
  "department": "Engineering"
}
```

---

## 7. Test the Auth Flow

### Start the development server

```bash
npm run dev
```

### Test Scenarios

#### 7.1 Sign Up + MFA Enrollment

1. Navigate to `http://localhost:5173/signup`.
2. Fill in name, email, password, select a role.
3. Click **"Create Account"**.
4. You'll be prompted to **set up MFA**:
   - Click **"Set up now"**.
   - Scan the QR code with **Google Authenticator**, **Microsoft Authenticator**, or **Authy**.
   - Enter the 6-digit code from your app.
   - Click **"Verify & Enable"**.
5. You should be redirected to the Dashboard.

#### 7.2 Login with MFA

1. Log out (or open an incognito window).
2. Navigate to `http://localhost:5173/login`.
3. Enter your email and password.
4. After successful password verification, you'll be prompted for a **TOTP code**.
5. Enter the 6-digit code from your authenticator app.
6. You should be logged in and redirected to the Dashboard.

#### 7.3 Session Persistence

1. Close the browser tab.
2. Open `http://localhost:5173/` again.
3. You should be **automatically authenticated** (no login screen).
4. If MFA is enabled and it's a trusted device, you'll see the TOTP verification screen directly.

#### 7.4 Role-Based Access

1. Sign up with **Employee** role.
2. Try accessing `/attribution`, `/employees`, or `/anomalies`.
3. You should see the **"Access Restricted"** screen.
4. Sign up with **Admin** role and verify you can access all routes.

#### 7.5 Logout + New Device Flow

1. While logged in, click the user avatar → **Logout** (when available) or clear local storage.
2. Navigate to a protected route like `/attribution`.
3. You should be redirected to the login page.
4. Enter credentials + TOTP code to regain access.

---

## 8. Troubleshooting

### "Supabase is not configured" Warning

**Issue:** Console shows `[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY`.

**Fix:** Ensure your `.env` file exists and has the correct values. Restart the dev server.

### MFA Enrollment Fails

**Issue:** TOTP enrollment returns an error.

**Possible causes:**
- MFA is disabled in Supabase dashboard → Check **Authentication → Providers → MFA Settings**.
- User is not authenticated → Ensure the user is logged in before enrolling.
- CORS issues → Add `http://localhost:5173` to **Authentication → Settings → Additional redirect URLs**.

### "Invalid TOTP Code" During Login

**Issue:** The TOTP code is rejected.

**Possible causes:**
- **Clock skew:** Your device's clock is not synchronized. Ensure your computer/phone clock is accurate (enable automatic time sync).
- **Wrong factor ID:** The MFA factor wasn't properly retrieved during login. Clear browser storage and try again.
- **Expired challenge:** The MFA challenge expired. Try logging in again.

### Session Not Persisting

**Issue:** User is asked to log in after refreshing the page.

**Fix:**
- Check that `localStorage` is not being cleared by browser settings.
- Ensure Supabase session is being stored: go to **Application → Local Storage** in DevTools and look for `sb-*-auth-token` keys.
- Verify `persistSession: true` is set (it is in `src/lib/supabase.ts`).

### Role Not Being Assigned

**Issue:** New users always have `employee` role regardless of selection.

**Fix:**
- Role is stored in `user_metadata`. If email confirmation is required, the metadata may not be set until the user confirms their email.
- In development, you can disable email confirmation in **Authentication → Settings → Confirm email**.

### CORS Errors

**Issue:** Browser blocks requests to Supabase.

**Fix:** In Supabase dashboard, go to **Authentication → Settings** and add your app URL:
- `http://localhost:5173` (development)
- `https://your-production-url.com` (production)

---

## Quick Reference

| Task | Location |
|------|----------|
| Supabase Dashboard | [https://supabase.com/dashboard](https://supabase.com/dashboard) |
| API Credentials | Project Settings → API |
| Auth Providers | Authentication → Providers |
| Auth Settings | Authentication → Settings |
| SQL Editor | SQL Editor |
| RLS Policies | Authentication → Policies (or SQL Editor) |
| `.env` File | Project root (gitignored) |
| Auth Source Code | `src/auth/` |
| Auth Services | `src/services/authService.ts`, `src/services/mfaService.ts` |
