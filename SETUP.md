# Tilago — Setup Guide

## Prerequisites
- Node.js 18+ installed (https://nodejs.org)
- Git
- A Supabase account (free tier works)
- Accounts for: Stripe, PayPal Developer, Cloudinary, Resend

---

## 1. Install Node.js
Download from https://nodejs.org (LTS version) and install. Then restart your terminal.

## 2. Install Dependencies
```bash
cd "C:\Users\Number.One\Desktop\Tilago C"
npm install
```

## 3. Set Up Environment Variables
Copy `.env.example` to `.env.local` and fill in all values:
```bash
copy .env.example .env.local
```

### Required services to set up:
- **Supabase**: Create project → Settings → Database → Connection String (Transaction pooler)
- **Stripe**: dashboard.stripe.com → API Keys → copy Secret + Publishable keys
- **PayPal**: developer.paypal.com → My Apps → Create App → copy Client ID + Secret
- **Cloudinary**: cloudinary.com → Dashboard → copy Cloud name, API Key, API Secret
- **Google OAuth**: console.cloud.google.com → APIs → OAuth 2.0 Client ID
- **Resend**: resend.com → API Keys → create key

## 4. Set Up Database
```bash
npx prisma generate
npx prisma db push
```

## 5. Create Admin User
After running the app, register normally, then in Supabase SQL editor:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

## 6. Run Development Server
```bash
npm run dev
```
Open http://localhost:3000

## 7. Stripe Webhook (local testing)
```bash
npx stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Project Structure
```
src/
├── app/
│   ├── alerts/          — Stream Alerts page
│   ├── stream/          — Stream Overlays page
│   ├── package/         — Full Packages page
│   ├── 3d/              — 3D Motion page
│   ├── cart/            — Shopping cart
│   ├── account/         — User account & orders
│   ├── admin/           — Admin dashboard (ADMIN role required)
│   ├── auth/            — Sign in / Sign up
│   ├── contact/         — Contact form
│   └── api/             — All API routes
├── components/          — Shared UI components
├── context/             — React context (Cart)
├── lib/                 — Utility libraries (prisma, stripe, etc.)
└── types/               — TypeScript types
prisma/
└── schema.prisma        — Database schema
```

## Deploy to Vercel
1. Push to GitHub
2. Import project on vercel.com
3. Add all env variables in Vercel Dashboard
4. Deploy → Vercel auto-runs `prisma generate && next build`
5. Add Stripe webhook endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
