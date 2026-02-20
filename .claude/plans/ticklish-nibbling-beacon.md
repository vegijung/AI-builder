# Supabase Database Configuration

## Context
Phase 3 code is fully implemented (Steps 1-12 complete). The user has entered their Supabase keys into `.env.example`. We now need to:
1. Create a proper `.env` file for Vite
2. Set up the database tables + seed data in Supabase
3. Enable email auth in Supabase dashboard
4. Install npm dependency + test

---

## Step 1: Create `.env` file
Copy the keys from `.env.example` into a new `.env` file (Vite reads `.env`, not `.env.example`). Then restore `.env.example` to placeholder values so real keys aren't committed to git.

## Step 2: Run the seed SQL in Supabase
The user needs to open the Supabase SQL Editor and paste + run `supabase/seed.sql`. This creates all 5 tables with RLS policies and inserts all seed data.

## Step 3: Enable Email Auth in Supabase
Enable the Email OTP provider in Supabase Authentication settings.

## Step 4: Install dependency + test
Run `npm install` then `npm run dev`.

## Verification
- App loads data from Supabase
- Admin login with @mmgmc.ch email works
- Export Report generates MMG-branded HTML
