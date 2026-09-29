'use client';

import Link from 'next/link';
import { useApp } from '@/lib/store';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const { dealerProfile } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-slate-800 dark:text-slate-200">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to store
      </Link>

      <h1 className="text-2xl font-black mb-1">Terms of B2B Trade</h1>
      <p className="text-xs text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs p-4 mb-8">
        <b>Template notice:</b> This is a starting draft, not legal advice. Review it with a lawyer before publishing,
        especially the credit/Khata, liability, and jurisdiction clauses.
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-bold text-base mb-2">1. Acceptance</h2>
          <p>
            By registering as a retailer on this platform, you agree to these Terms of Trade with{' '}
            <b>{dealerProfile.businessName || '[Your Business Name]'}</b> ("we", "us", "the dealer").
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">2. Orders and pricing</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Prices shown are wholesale prices per the listed pack size/MOQ and may include tiered discounts for higher quantities.</li>
            <li>All prices exclude GST unless stated otherwise; GST is calculated and added at checkout per applicable rates.</li>
            <li>We reserve the right to reject or cancel an order due to stock unavailability, pricing errors, or credit limit issues.</li>
            <li>Order confirmation does not guarantee availability until dispatch is confirmed.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">3. Credit (Khata) terms</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Credit limits are granted at our discretion and may be revised or revoked at any time.</li>
            <li>Outstanding balances must be settled within [X] days of the invoice date, unless otherwise agreed in writing.</li>
            <li>We may charge interest of [X]% per month on overdue balances beyond the due date, as permitted by law.</li>
            <li>We may suspend further credit orders while a balance remains overdue.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">4. Payments</h2>
          <p>
            Payments may be made via UPI, bank transfer, cash on delivery, or credit (Khata), as offered at checkout.
            Payments made via UPI/bank transfer are confirmed once received and verified by us or our payment
            gateway.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">5. Delivery</h2>
          <p>
            Delivery timelines are estimates and not guaranteed. Risk in goods passes to the retailer upon delivery
            or handover to the transporter, whichever is earlier, unless otherwise agreed.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">6. Returns, shortages and disputes</h2>
          <p>
            Any shortage, damage, or discrepancy must be reported within [X] hours/days of delivery with photo
            evidence. See our <Link href="/refund" className="text-emerald-600 dark:text-emerald-400 hover:underline">Cancellation &amp; Refund Policy</Link> for details.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">7. Limitation of liability</h2>
          <p>
            To the extent permitted by law, our liability for any claim relating to an order is limited to the value
            of that order. We are not liable for indirect or consequential losses.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">8. Governing law</h2>
          <p>
            These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of
            the courts at [City, State].
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">9. Contact us</h2>
          <p>
            Questions about these terms can be sent to <b>{dealerProfile.email || '[your business email]'}</b> or{' '}
            <b>{dealerProfile.phone || '[your business phone]'}</b>.
          </p>
        </section>
      </div>
    </div>
  );
}
