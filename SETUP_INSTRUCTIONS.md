# 🚀 Elevate X Enterprise — Setup Guide

## What's Built
A full e-commerce website for your laptop/computer shop with:
- 🏠 Home page with hero, categories & featured products
- 🛍️ Product listings with search, filters & pagination
- 📦 Product detail pages with specs & image gallery
- 🛒 Shopping cart & checkout
- 👤 User auth (sign up / login)
- 📋 Account & order history pages
- ⚙️ Admin dashboard (manage products, orders, categories)

---

## Step 1 — Create a Supabase Project

1. Go to **https://supabase.com** and sign in (or create a free account)
2. Click **"New project"**
3. Name it: `elevate-x-enterprise`
4. Choose a strong database password (save it)
5. Pick the region closest to you
6. Click **"Create new project"** and wait ~2 minutes

---

## Step 2 — Run the Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file: `supabase/schema.sql` from this project folder
4. Copy ALL its contents and paste into the SQL editor
5. Click **"Run"** (or press Cmd+Enter)

This will create all tables, security policies, triggers, and seed sample products.

---

## Step 3 — Get Your API Keys

1. In Supabase, go to **Settings → API** (left sidebar)
2. Copy two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (a long JWT string)

---

## Step 4 — Create the .env.local file

In the project root (`elevate-x-enterprise/`), create a file called `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with what you copied in Step 3.

---

## Step 5 — Configure Auth Redirect URL

1. In Supabase, go to **Authentication → URL Configuration**
2. Add to **Redirect URLs**: `http://localhost:3000/auth/callback`
3. When deploying to production, also add your live URL

---

## Step 6 — Launch the Dev Server

Open Terminal, navigate to the project folder, and run:

```bash
cd elevate-x-enterprise
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## Step 7 — Create Your Admin Account

1. Go to **http://localhost:3000/auth/register** and create an account
2. In Supabase → **Table Editor → profiles**
3. Find your user row and set `is_admin = true`
4. Now go to **http://localhost:3000/admin** — you'll have full admin access!

---

## Project Structure

```
elevate-x-enterprise/
├── src/app/
│   ├── page.tsx              ← Home page
│   ├── products/             ← Shop + product detail
│   ├── cart/                 ← Shopping cart
│   ├── checkout/             ← Checkout
│   ├── auth/                 ← Login / Register
│   ├── account/              ← Profile + Orders
│   └── admin/                ← Admin dashboard
├── src/components/           ← Navbar, Footer, ProductCard
├── src/context/              ← CartContext
├── src/lib/supabase/         ← Supabase client helpers
├── supabase/schema.sql       ← Database schema + seed data
└── .env.local                ← YOUR API KEYS (create this)
```

---

## Deploying to Production (Vercel)

```bash
npm install -g vercel
vercel
```

Add your environment variables in the Vercel dashboard under Settings → Environment Variables.

---

## Need Help?

- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs
