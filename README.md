# VyaparHub (व्यापारहब)

> **Next-Generation B2B FMCG Wholesale Distribution & Working Capital Engine**  
> Empowering India’s Kirana retail ecosystem with direct-from-mill pricing, digital Khata credit management, statutory GST & E-Way compliance, and barcode-verified warehouse fulfillment.

---

## Key Highlights

- **Multi-Role Portals**: Tailored interfaces for **Kirana Retailers** (procurement & ledger), **Wholesale Dealers** (dispatch, catalogue & debt recovery), and **Field Sales Representatives** (mandi beat & spot cash collection).
- **Dual GST Engine & Statutory E-Way Bills**: Automatic intra-state (CGST + SGST) vs. inter-state (IGST) split by buyer state, per-product HSN tax rates (0/5/12/18/28%), and CGST Rule 138 compliant E-Way Bill generator with 1-click **NIC JSON Export**.
- **Working Capital & Digital Khata**: Underwritten credit limits, real-time debt calculation, and 1-tap dynamic NPCI UPI QR code debt settlement.
- **Warehouse Barcode Scanner**: Dual-input scanner supporting both device webcams and high-speed **USB/Bluetooth laser barcode guns** with audio feedback (880Hz chime, 220Hz error buzz) and printable A6 shipping labels.
- **ACID Concurrency Protection**: High-volume checkout transactions wrapped in Prisma ACID locks with inventory pre-checks, eliminating overselling and inventory race conditions.
- **Enterprise Security**: Role-based access control on every API endpoint (`src/lib/guard.ts`), constant-time HMAC webhook verification, rate limiting, and zero client-exposed secrets.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Components & Server Actions) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict mode, 0 errors) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) with Dark/Light theme support |
| **ORM & Database** | [Prisma ORM 5](https://www.prisma.io/) with SQLite (local/Docker) or PostgreSQL (cloud) |
| **Authentication** | Stateless HTTP-only JWT sessions via [`jose`](https://github.com/panva/jose) & `bcryptjs` |
| **Documents & Data** | `jspdf` & `jspdf-autotable` (Invoices/Labels), `exceljs` (XLSX reports) |
| **Testing** | [Vitest](https://vitest.dev/) unit test suite |

---

## Quick Start (Local Setup)

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 2. Clone & Install
```bash
git clone https://github.com/omkumar-01codes/Vyaparhub-wholesale-app.git
cd Vyaparhub-wholesale-app
npm install
```

### 3. Environment Configuration
Create a local `.env` file from the provided template:
```bash
cp .env.example .env
```
Fill in the values (for local testing, default values work out of the box):
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="generate_a_random_32_character_string_for_local_testing"
WEBHOOK_SECRET="whsec_testing_local_secret"
DEALER_STATE="Delhi"
NEW_ACCOUNT_CREDIT_LIMIT="0"
NEXT_PUBLIC_DEMO_MODE="true"
```

### 4. Database Setup & Seed
```bash
# Push database schema
npm run db:push

# Seed FMCG catalogue, demo retailers, and dealer account
npm run seed
```

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Default Demo Credentials

When `NEXT_PUBLIC_DEMO_MODE=true` is enabled, the sign-in modal displays 1-click test logins:

| Role | Email / Phone | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Wholesale Dealer** | `dealer@vyaparhub.com` | `AdminPassword123!` | `/dealer` |
| **Kirana Retailer** | `9811122334` | `Password123!` | `/` & `/my-debt` |
| **Sales Representative** | `sales@vyaparhub.com` | `SalesPassword123!` | `/sales` |

---

## Running Automated Tests

```bash
# Run Vitest test suite (GST calculations, credit validation, auth guards)
npm test

# Run TypeScript compilation check
npx tsc --noEmit
```

---

## Production Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for full instructions:
- **Railway.app** (Docker + Persistent Volume for SQLite — recommended for zero-config hosting)
- **Render.com** (Web Service + Persistent Disk)
- **Vercel / Netlify** (Switch Prisma provider to PostgreSQL via Neon/Supabase)

---

## Architecture & Compliance

- **E-Way Bill Compliance**: Follows National Informatics Centre (NIC) statutory schema for CGST Rule 138 consignments > ₹50,000.
- **Dual GST Calculation**: Implements mathematical apportionment for tiered discounts before applying individual line-item GST slabs.
- **Security Notice**: Production deployments must set `NEXT_PUBLIC_DEMO_MODE="false"` and configure strong `JWT_SECRET` and `WEBHOOK_SECRET` keys.

---

## License

MIT License. Designed and built for modern Indian FMCG distribution.
