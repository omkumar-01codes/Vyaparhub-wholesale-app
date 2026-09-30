'use client';

import Link from 'next/link';
import { useApp } from '@/lib/store';
import { ArrowLeft } from 'lucide-react';

export default function RefundPolicyPage() {
  const { dealerProfile } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-slate-800 dark:text-slate-200">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to store
      </Link>

      <h1 className="text-2xl font-black mb-1">Cancellation &amp; Refund Policy</h1>
      <p className="text-xs text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs p-4 mb-8">
        <b>Template notice:</b> This is a starting draft, not legal advice. Payment gateways (Razorpay, Cashfree,
        etc.) typically require a published refund policy — fill in the placeholders below and review with a
        lawyer before publishing.
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-bold text-base mb-2">1. Order cancellation</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Orders can be cancelled free of charge before they are dispatched. Contact us as soon as possible after placing an order you wish to cancel.</li>
            <li>Once an order is marked &quot;Dispatched,&quot; it can no longer be cancelled and must instead be handled as a return (see below).</li>
            <li>We may cancel an order due to stock unavailability, pricing errors, or credit issues; in that case any payment received is refunded in full.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">2. Shortages and damaged goods</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Check your delivery against the invoice at the time of handover, where possible.</li>
            <li>Report any shortage, damage, or wrong item within [X] hours/days of delivery, with photos, to {dealerProfile.phone || '[your business phone]'}.</li>
            <li>Valid claims are resolved by replacement, a credit note against your Khata, or a refund, at our discretion.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">3. Refund method and timeline</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Refunds for UPI/online payments are made to the original payment method within [X] business days of approval.</li>
            <li>Refunds against a credit (Khata) order are issued as a credit note adjusted against your outstanding balance.</li>
            <li>Cash-on-delivery refunds, where applicable, are made via bank transfer or UPI within [X] business days.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">4. Non-returnable items</h2>
          <p>
            Perishable goods, opened/used cartons, and items explicitly marked non-returnable at checkout cannot be
            returned unless found defective on delivery. [Adjust this list to your actual catalogue.]
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">5. Contact for disputes</h2>
          <p>
            For any cancellation, return, or refund query, contact <b>{dealerProfile.businessName || '[Your Business Name]'}</b> at{' '}
            <b>{dealerProfile.email || '[your business email]'}</b> or <b>{dealerProfile.phone || '[your business phone]'}</b>. See
            also our <Link href="/terms" className="text-emerald-600 dark:text-emerald-400 hover:underline">Terms of B2B Trade</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
