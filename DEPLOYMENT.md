# VyaparHub Production Deployment Guide

## 1. Environment Variables Configuration

Before deploying, prepare your production environment variables. Never commit `.env` to git.

| Variable | Description | Production Recommended Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | Database connection string | `file:/app/prisma/dev.db` (for SQLite on Railway/Render) or `postgresql://...` (for Neon/Supabase) |
| `JWT_SECRET` | 32+ character random secret for signing authentication sessions | Generate with `openssl rand -base64 48` |
| `WEBHOOK_SECRET` | Secret key for Razorpay/Cashfree payment webhooks | Generate with `openssl rand -hex 24` |
| `DEALER_STATE` | Wholesaler depot origin state for GST engine | `Delhi` (or your state) |
| `NEW_ACCOUNT_CREDIT_LIMIT` | Credit assigned to newly registered retail shops | `0` (Prevents fraud; dealer unlocks manually) |
| `SEED_DEALER_EMAIL` | Admin login email for initial dealer seed | `dealer@yourdomain.com` |
| `SEED_DEALER_PHONE` | Admin login phone number | `9876500000` |
| `SEED_DEALER_PASSWORD` | Strong password for dealer account | A strong password |
| `SEED_DEMO_USERS` | Whether to seed fake customer/sales accounts | `false` |
| `NEXT_PUBLIC_DEMO_MODE` | Show 1-click quick login buttons | `false` |

---

## 2. Pushing to GitHub

1. Create a new repository on [GitHub](https://github.com/new) (e.g. `wholesale-app` or `vyaparhub`). **Do not initialize with README or .gitignore**.
2. Run the following commands from your project root:
   ```bash
   git add .
   git commit -m "Production release: VyaparHub B2B Wholesale Platform"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

---

## 3. Hosting Options

### Option A: Railway (Recommended — Keeps SQLite with Zero Database Setup)
1. Go to [Railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** &rarr; **Deploy from GitHub repo**.
3. Select your repository. Railway will detect the `Dockerfile` automatically.
4. Go to **Settings** &rarr; **Volumes** &rarr; **Add Volume**:
   - Mount Path: `/app/prisma`
   - This ensures your SQLite database file (`dev.db`) persists across deployments.
5. In **Variables**, add all the environment variables from the table above.
6. Click **Deploy**. Your app is live with SSL!

### Option B: Render.com (Web Service + Persistent Disk)
1. Sign in to [Render.com](https://render.com) and click **New +** &rarr; **Web Service**.
2. Connect your GitHub repository.
3. Choose **Docker** environment (or Node with Build: `npm run build`, Start: `npm start`).
4. Under **Disks**, add a persistent disk:
   - Mount Path: `/app/prisma`
   - Size: 1 GB
5. Add your environment variables in the Render dashboard.

### Option C: Netlify / Vercel (Requires Cloud PostgreSQL)
1. Create a free PostgreSQL database at [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
3. In your local terminal, run `npx prisma db push && npm run seed` to initialize the cloud DB.
4. Import your GitHub repository into Netlify or Vercel.
5. Add your environment variables (with `DATABASE_URL` pointing to your Neon/Supabase Postgres).
6. Build command: `prisma generate && next build`
