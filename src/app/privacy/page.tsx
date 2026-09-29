'use client';

import Link from 'next/link';
import { useApp } from '@/lib/store';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { dealerProfile } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-slate-800 dark:text-slate-200">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to store
      </Link>

      <h1 className="text-2xl font-black mb-1">Privacy Policy</h1>
      <p className="text-xs text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs p-4 mb-8">
        <b>Template notice:</b> This is a starting draft, not legal advice. Review it with a lawyer and fill in the
        placeholders (marked <code>[ ]</code>) with your actual business details before publishing.
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-bold text-base mb-2">1. Who we are</h2>
          <p>
            This Privacy Policy explains how <b>{dealerProfile.businessName || '[Your Business Name]'}</b> ("we", "us")
            collects, uses, and protects information when retailers use this platform to place wholesale orders.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">2. Information we collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Account details: name, business name, phone number, email, GSTIN, and address you provide at registration.</li>
            <li>Order and transaction data: products ordered, quantities, prices, payment mode, and delivery details.</li>
            <li>Khata (credit ledger) data: outstanding balances and payment history needed to manage credit accounts.</li>
            <li>Technical data: IP address and basic device/browser information, used for security (e.g. rate limiting).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">3. How we use this information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To create and manage your account, and process orders and payments.</li>
            <li>To maintain accurate Khata records and send payment reminders for outstanding dues.</li>
            <li>To generate invoices, e-way bill references, and other documents required by law.</li>
            <li>To detect and prevent fraud, abuse, and unauthorised access.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">4. How we share information</h2>
          <p>
            We do not sell personal information. We share data only with: payment gateway providers (to process
            payments), logistics/transporters (to deliver orders), and where required by law or a valid legal
            request. [List any other processors you actually use, e.g. SMS/WhatsApp providers, hosting provider.]
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">5. Data retention</h2>
          <p>
            We retain account, order, and ledger records for as long as your account is active and afterward as
            required for accounting, tax, and legal purposes (typically [X] years under Indian tax law — confirm
            the exact period with your accountant).
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">6. Your rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data, subject to our legal
            obligation to retain financial records. Contact us using the details below.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">7. Security</h2>
          <p>
            We use reasonable technical measures (encrypted sessions, access controls) to protect your information.
            No online system is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">8. Contact us</h2>
          <p>
            For privacy questions, contact us at <b>{dealerProfile.email || '[your business email]'}</b> or{' '}
            <b>{dealerProfile.phone || '[your business phone]'}</b>.
          </p>
        </section>
      </div>
    </div>
  );
}
