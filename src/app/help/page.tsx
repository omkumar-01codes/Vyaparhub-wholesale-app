'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  BookOpen,
  Store,
  Building2,
  Bike,
  ShieldCheck,
  CreditCard,
  Barcode,
  Truck,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  QrCode,
  MessageCircle,
  DollarSign
} from 'lucide-react';
import { useApp } from '@/lib/store';

export default function HelpPage() {
  const { openAuthModal } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'KIRANA' | 'DEALER' | 'SALES' | 'TAX_TECH'>('KIRANA');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the Khata credit line approval work for new Kirana stores?',
      a: 'To safeguard against fraud and protect wholesale inventory, new stores register with a ₹0 credit limit and can immediately place wholesale orders using Instant UPI / Advance Payment. Once the wholesale dealer verifies the physical store (via GSTIN, trade references, or beat visit), the dealer activates your 30-day Khata credit line and sets your limit based on purchasing volume.'
    },
    {
      q: 'When is a statutory E-Way Bill generated and how do I export the NIC JSON?',
      a: 'Pursuant to Section 138 of the Central Goods & Services Tax (CGST) Rules, any inter-state or intra-state commercial consignment exceeding ₹50,000 automatically triggers statutory E-Way Bill generation. In the Dealer Dispatch Queue (/dealer/orders), consignments > ₹50,000 display an "E-Way Bill" badge. Clicking it opens the official slip with Part A (HSN, GSTIN, Taxes) and Part B (Vehicle DL-01-AB-4892, Transporter ID), complete with an official QR code and a 1-click "Export NIC JSON" button matching the schema required by the National Informatics Centre portal (ewaybillgst.gov.in).'
    },
    {
      q: 'Can I use a physical handheld laser barcode scanner in the warehouse?',
      a: 'Yes! The Warehouse Dispatch Scanner (/dealer/orders) supports dual inputs: standard device webcams for QR/barcodes AND physical USB/Bluetooth laser barcode guns. Laser scanners emulate high-speed keyboard input; the scanner listens to keystroke buffers with an audio chime (880Hz for valid matches, 220Hz error buzz for over-scans).'
    },
    {
      q: 'How does the Dual GST Tax Engine calculate CGST, SGST, and IGST?',
      a: 'VyaparHub inspects the delivery state against the wholesaler depot origin (Delhi). For intra-state consignments (Delhi to Delhi), the 5% FMCG GST is split equally into CGST (2.5%) and SGST (2.5%). For inter-state consignments (Delhi to Uttar Pradesh, Gujarat, West Bengal, etc.), it is calculated as IGST (5.0%). HSN codes (e.g. 1507 for Oil, 1101 for Atta, 0902 for Tea) are automatically attributed on every invoice.'
    },
    {
      q: 'What prevents overselling or inventory race conditions when multiple orders occur at once?',
      a: 'All checkouts are wrapped in Prisma ACID transactions ($transaction). Before any stock decrement occurs, the engine performs an atomic SQL pre-check: if (currentProd.stockQty < item.quantity) throw new Error(...). If stock is insufficient, the transaction rolls back cleanly with zero overselling.'
    },
    {
      q: 'How does the Field Sales Representative portal enforce credit limits?',
      a: 'When a sales representative visits a Kirana shop on their daily beat (/sales), selecting the shop dynamically displays their current outstanding Khata debt and remaining credit buffer. If an order total exceeds their available limit, the system locks submission on credit until an on-spot cash collection is logged or the order is adjusted.'
    }
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-300">
      
      {/* Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 border border-slate-800 text-white p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>VyaparHub Knowledgebase & Full Guide</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Everything you need to master B2B wholesale distribution.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Step-by-step documentation for Kirana Store Retailers, Wholesale Dealers, and Field Sales Representatives — covering volume pricing, Khata credit, barcode verification, GST, and statutory E-Way Bills.
          </p>

          {/* Search Box */}
          <div className="pt-2 relative max-w-xl">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guides, E-Way bills, Khata credit, GST rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Role Guide Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 p-1.5 bg-slate-200/80 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('KIRANA')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'KIRANA'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Kirana Retailer Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('DEALER')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'DEALER'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Wholesale Dealer Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('SALES')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'SALES'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-800'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Salesman Beat Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('TAX_TECH')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'TAX_TECH'
              ? 'bg-violet-600 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Tax, GST & Concurrency</span>
        </button>
      </div>

      {/* TAB CONTENT 1: KIRANA RETAILER */}
      {activeTab === 'KIRANA' && (
        <div id="kirana-guide" className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    Kirana Retailer Complete Flow
                  </h2>
                  <p className="text-xs text-slate-500">
                    From registering your store to volume discounts, 30-day Khata credit, and 1-tap UPI QR payoff.
                  </p>
                </div>
              </div>

              <button
                onClick={() => openAuthModal('REGISTER')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <span>Register Store Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                  1
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Store Onboarding & Khata Credit Activation
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Click <b>Register Store</b> in the top navbar. Enter your Kirana store name, owner name, mobile number, city, and address. New accounts start with instant UPI ordering; your dealer verifies your store details to unlock a tailored 30-day Khata credit line with zero paperwork.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                  2
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Volume Slabs & Margin Optimization
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every product displays tiered volume discounts (e.g. <b>5+ pcs</b>, <b>15+ pcs</b>, <b>50+ pcs</b>). The cart dynamically applies the lowest wholesale slab price as you add cartons, calculating your expected retail profit margin in real-time.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                  3
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Zero-Cash Khata & 1-Tap UPI Pay
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Checkout with <b>Add to 30-Day Khata Debt</b>. Your order is immediately transmitted to the warehouse dispatch queue. Settle your balance anytime via <b>My Khata Ledger</b> using the dynamic NPCI UPI QR code.
                </p>
              </div>

            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300 text-xs flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
              <span>
                <b>Getting started:</b> Register your store with your mobile number, then sign in to place orders and track your Khata.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: WHOLESALE DEALER */}
      {activeTab === 'DEALER' && (
        <div id="dealer-guide" className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    Wholesale Dealer Master Console
                  </h2>
                  <p className="text-xs text-slate-500">
                    Secure dealer login, warehouse laser barcode scanning, statutory E-Way Bills & automated debt recovery.
                  </p>
                </div>
              </div>

              <Link
                href="/dealer/orders"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <span>Open Dealer Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                  1
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Dealer Login
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sign in with your dealer account to open the Dealer Center. Server-side checks protect every dealer page and API.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                  2
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Warehouse Laser & Webcam Scanner
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  In <b>/dealer/orders</b>, click <b>Scan & Dispatch</b>. Point your device camera or plug in any standard handheld USB laser scanner gun. Real-time audio beeps confirm packed items, preventing mis-shipments.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                  3
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Statutory E-Way Bills & NIC Export
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Consignments exceeding ₹50,000 unlock an official <b>E-Way Bill</b> slip under CGST Rule 138. Includes Part A tax breakdown, Part B vehicle number, verification QR, and 1-click <b>NIC JSON Export</b>.
                </p>
              </div>

            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <b>WhatsApp Debt Reminders:</b> Visit <b>/dealer/ledger</b> to send 1-click Gentle, Formal, or Urgent payment reminders directly to retailers via WhatsApp with embedded UPI deep-links.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: SALES REPRESENTATIVE */}
      {activeTab === 'SALES' && (
        <div id="sales-guide" className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900">
                  <Bike className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    Field Sales Representative Beat Guide
                  </h2>
                  <p className="text-xs text-slate-500">
                    On-ground Kirana shop visits, rapid volume booking, credit limits & on-spot cash collection.
                  </p>
                </div>
              </div>

              <Link
                href="/sales"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <span>Launch Sales Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-black text-sm flex items-center justify-center">
                  1
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Select Beat Kirana Store
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Upon arriving at the retailer’s shop, select the store from the dropdown. The header immediately displays their <b>Outstanding Khata Debt</b>, total <b>Credit Limit</b>, and remaining credit balance.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-black text-sm flex items-center justify-center">
                  2
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Rapid Volume Matrix Booking
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Use 1-tap volume buttons (<b>+5</b>, <b>+15</b>, <b>+50</b>) to book bulk cartons at tiered rates. Wholesale profit margin badges show shopkeepers exactly how much profit they make on every unit sold.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-black text-sm flex items-center justify-center">
                  3
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  On-Spot Cash Collection
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  If the shopkeeper pays in cash or cheque, click <b>Collect Payment</b>. Enter the amount to instantly credit their Khata ledger and free up their credit line for immediate order booking.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: TAX, GST & CONCURRENCY */}
      {activeTab === 'TAX_TECH' && (
        <div id="tax-guide" className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-200 dark:border-violet-900">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Financial, Tax & Concurrency Architecture
                </h2>
                <p className="text-xs text-slate-500">
                  Dual GST calculations, FMCG HSN codes, automated payment webhooks & ACID race-condition protection.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>Dual GST Tax Engine</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Automatic state detection compares delivery address against wholesaler base (Delhi):<br />
                  &bull; <b>Intra-State:</b> CGST (2.5%) + SGST (2.5%) for Delhi &rarr; Delhi.<br />
                  &bull; <b>Inter-State:</b> IGST (5.0%) for Delhi &rarr; UP, Gujarat, West Bengal.<br />
                  Every item is tagged with statutory HSN codes (e.g. <code>1507</code>, <code>1101</code>, <code>0902</code>).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <CreditCard className="w-4 h-4" />
                  <span>Payment Webhook Listener</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Endpoint <code>/api/webhooks/payment</code> accepts Razorpay/Cashfree payloads, automatically updates orders to <b>PAID</b>, records bank UTR reference, and atomically decreases the customer’s outstanding Khata debt.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>ACID Concurrency Protection</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  High-volume festival restocks are protected by Prisma transactions with pre-check guard clauses (<code>stockQty &gt;= quantity</code>). Orders abort safely if an item goes out of stock, eliminating inventory corruption.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                  <MessageCircle className="w-4 h-4" />
                  <span>Automated Batch Debt Cron</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Endpoint <code>/api/reminders/batch</code> scans all overdue accounts, builds 1-tap NPCI UPI deep-links, and dispatches WhatsApp statements across delinquent accounts with zero manual effort.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* FAQ Accordion Section */}
      <div id="faq" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Frequently Asked Questions (FAQ)
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? 'answer' : 'answers'}
          </span>
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    {faq.q}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
