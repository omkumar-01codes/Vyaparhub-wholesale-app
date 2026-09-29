# Security & correctness fixes (pre-hosting pass)

## Setup after unzipping
1. `cp .env.example .env` and fill in `JWT_SECRET` (`openssl rand -base64 48`), `WEBHOOK_SECRET`, and the `SEED_DEALER_*` values.
2. `npm install` (runs `prisma generate`), then `npm run db:push` and `npm run seed`.
3. `npm run build && npm start` and test the flows below.
4. For production, switch Prisma to Postgres (see `.env.example`). SQLite will not work on Vercel/Netlify.

## What changed
**Auth / access control**
- Every API route now checks the signed session itself (`src/lib/guard.ts`); middleware is no longer the only gate.
  Retailers only see their own customer record, orders and ledger. Only the dealer can write products, order status, customers and the dealer profile. Dealer and sales reps can record payments.
- Removed the `1234` dealer PIN (client and server), the hardcoded `dealer/admin` login and the plaintext-password fallback.
- `JWT_SECRET` is required in production (no hardcoded fallback).
- `/api/auth/me` no longer accepts `?userId=`. Added `/api/auth/logout` (the cookie is httpOnly, so it has to be cleared server-side).
- Generic login error, per-IP and per-account rate limiting, password minimum of 8 characters, phone/email/GSTIN validation.
- New shops start with ₹0 credit (`NEW_ACCOUNT_CREDIT_LIMIT` to change).
- Sessions re-check the user in the DB, so deleting a user or changing a role takes effect immediately.

**Orders / money**
- The server now prices orders (tiers, MOQ, discount, GST). The browser only sends product ids and quantities. Customer identity comes from the session.
- Atomic stock decrement (no overselling), credit check inside the transaction, unguessable order numbers and ids, decimals kept to 2 places.
- GST: discount is applied first, then tax. The dealer state is derived from the dealer GSTIN (previously hardcoded to Delhi). An unknown buyer state is treated as inter-state.
- The client now waits for the server's order and reloads stock, debt and ledger from it. Before, it faked the order locally and synced in the background, so ids differed and server rejections were silent.
- Fake e-way bill numbers, transporter and vehicle details are gone. The modal says "not generated"; the dealer can PATCH real values.

**Payment webhook**
- HMAC signature required (`WEBHOOK_SECRET`, header `x-razorpay-signature` or `x-webhook-signature`), amount must match the order total, idempotent, and only credit-purchase orders reduce the Khata balance.

**Data exposure**
- Customers, orders, ledger and dealer profile are no longer cached in localStorage (old keys are purged). Server errors no longer return `error.message`.
- `.env` and `dev.db` removed from the package; `.gitignore` added; demo quick-login buttons only render when `NEXT_PUBLIC_DEMO_MODE=true`; the seed creates no default passwords (dealer credentials come from env; demo users only with `SEED_DEMO_USERS=true` outside production).
- Security headers added; image hosts restricted to images.unsplash.com.

## Still to do (not done here)
- Move to Postgres and use `prisma migrate`.
- Per-product GST rates from HSN codes (currently a flat 5%).
- Replace the in-memory rate limiter with a shared store if you run more than one instance.
- `xlsx@0.18.5` has known advisories (export-only use here is lower risk); consider `exceljs`.
- `src/lib/db.ts` demo data still ships in the client bundle as fallback content.
- Add tests for order, credit, ledger and webhook paths; add Privacy/Terms/Refund pages; error monitoring.
- Not run end to end: Prisma could not be generated in my sandbox (engine download blocked), so please run the build and click through the flows yourself. Type errors: none other than the missing generated Prisma client.

## Second pass — remaining items fixed

**Per-product GST (was: flat 5% on everything)**
- Added `gstRate` to `Product` (and a snapshot on `OrderItem`, so old invoices don't change if you edit a product later).
- `lib/gst.ts` now has `computeOrderTotals()`: the order-level bulk discount is spread proportionally across lines, then each line is taxed at its own product's rate (0/5/12/18/28%), matching how GST actually works.
- The product form has a GST Rate dropdown, plus an HSN-code-based hint (`hsnRateHint` in `lib/gst.ts`) that pre-fills a likely rate — always confirm the real slab on the GST portal before saving.
- All hardcoded "GST (5%)" / "CGST (2.5%)" labels (cart, sales pad, orders list, PDF invoice, e-way bill) now say "GST"/"CGST"/etc. without a baked-in number, since it varies by product.
- **Action needed:** run `npm run db:push` again (adds the new columns) and re-run `npm run seed` if you want the demo catalogue's per-category rates.

**`xlsx` → `exceljs`**
- Replaced the vulnerable `xlsx@0.18.5` package. `lib/export-utils.ts` now builds `.xlsx` files with `exceljs` (async — call sites use `void exportOrdersToExcel(...)`/`void exportLedgerToExcel(...)`). PDF export is unchanged.

**Honest "AI" insights (was: hardcoded fake demo numbers)**
- `lib/analytics.ts` computes real monthly revenue/debt-recovery/order-count from your actual orders and ledger, and real per-state performance from your actual customers and orders — no invented numbers.
- The one-paragraph summary (`buildInsightsSummary`) is a rule-based report built from those real numbers, not a live model call. Renamed the UI from "AI Executive ... Report" to "Business Summary / Report" so it doesn't overclaim.
- Deleted the old hardcoded `monthlyHistoricalStats` / `regionalInsights` demo arrays from `lib/db.ts`.

**Legal pages (payment gateways generally require these)**
- Added `/privacy`, `/terms`, `/refund` — real content, clearly marked as a starting template to review with a lawyer and fill in your specifics (marked `[ ]`). Footer links now point to these instead of `/help` anchors.

**Tests**
- Added `vitest` with unit tests for the money-critical pure logic: `lib/gst.ts` (bulk discount, per-line multi-rate tax, intra/inter-state, HSN hints) and `lib/validate.ts` (phone normalisation, GSTIN/email regex, rounding, required-field checks). Run with `npm test`. These don't touch the database, so they run without any setup.

## Still not done (needs infrastructure I don't have here)
- Postgres migration — still SQLite by default; switch `provider` in `schema.prisma` and run `prisma migrate` against a real Postgres instance.
- Shared (multi-instance) rate limiting — current limiter is in-memory, single-instance only.
- Integration tests for the API routes themselves (need a running DB) and end-to-end tests of the checkout flow.
- Error monitoring (Sentry or similar) — no account/DSN to wire up from here.
