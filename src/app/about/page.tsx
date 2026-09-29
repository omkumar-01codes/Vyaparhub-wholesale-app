'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Store,
  ShieldCheck,
  TrendingUp,
  Truck,
  CheckCircle2,
  Users,
  MapPin,
  Mail,
  Phone,
  FileText,
  CreditCard,
  Briefcase,
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';
import { useApp } from '@/lib/store';

export default function AboutPage() {
  const { openAuthModal } = useApp();

  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-300">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 border border-slate-800 text-white p-6 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>About VyaparHub Wholesale</span>
          </div>

          <h1 className="text-2xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Digitizing Bharat’s FMCG Mandi Trade & Wholesale Credit.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            VyaparHub bridges India’s traditional wholesale distribution networks with enterprise technology — providing Kirana store owners direct-from-mill pricing, verified 30-day Khata credit lines, barcode-verified logistics, and statutory GST compliance.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => openAuthModal('REGISTER')}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer"
            >
              <span>Join as Kirana Retailer</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/help"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <span>Read Full Platform Guide</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Real-World Operational Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-2xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 font-mono">
            1,200+
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
            Active Kirana Stores
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across Delhi & UP Mandis</div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-2xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            ₹4.8 Cr+
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
            Monthly Wholesale Volume
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">High-Velocity FMCG Goods</div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-2xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 font-mono">
            99.4%
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
            Barcode Packing Accuracy
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Laser & QR Verification</div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-2xl sm:text-4xl font-black text-violet-600 dark:text-violet-400 font-mono">
            100%
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
            GST & E-Way Compliant
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Rule 138 NIC JSON Ready</div>
        </div>
      </div>

      {/* Mission Section */}
      <div id="mission" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="max-w-3xl space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Our Mission: Empowering India’s 13 Million Kirana Merchants
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Neighborhood Kirana stores form the backbone of India’s retail economy, serving over 90% of household consumer demand. Yet, traditional distribution forces shopkeepers through multiple middleman markups, paper-based debt ledgers with zero transparency, and frequent dispatch errors.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            VyaparHub eliminates these inefficiencies. By uniting <b>Direct Mill Procurement</b>, <b>Transparent Volume Slabs</b>, <b>Automated Digital Khata Credit</b>, and <b>Warehouse Barcode Dispatch Verification</b> into a single unified engine, we give everyday Kirana traders the enterprise-grade tools they need to maximize margins and grow their businesses sustainably.
          </p>
        </div>
      </div>

      {/* 4 Core Pillars */}
      <div id="pillars" className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            The 4 Pillars of the VyaparHub Architecture
          </h2>
          <p className="text-xs text-slate-500">
            Engineered from the ground up for the unique speed, credit, and compliance needs of Indian commerce.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Pillar 1 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              1. Direct Mill Sourcing & Tiered Wholesale Margins
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We aggregate procurement directly from top FMCG mills (Adani Wilmar, Tata Consumer, ITC, Cadbury, Nestlé). Kirana shops unlock escalating volume discounts based on carton quantities, with margin indicators showing exact profit gains per unit.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              2. Digital Khata Ledger & 30-Day Working Capital
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              New stores start with instant UPI ordering; upon dealer trade verification, accounts unlock a 30-day Khata working capital credit line tailored to their purchase volume. Orders on credit are tracked with 1-tap NPCI UPI QR reconciliation.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              3. Barcode Dispatch Verification & Laser Scanning
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Warehouse fulfillment is verified via device webcams or handheld USB laser barcode guns. Audible chimes confirm item counts, ensuring 100% carton accuracy before generating high-resolution printable shipping labels.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              4. Dual GST Tax & Statutory E-Way Bill Rule 138
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Full statutory compliance with automatic state-based GST splitting (CGST+SGST for intra-state vs IGST for inter-state) and instant statutory E-Way Bill generation for consignments exceeding ₹50,000 with 1-click NIC JSON export.
            </p>
          </div>

        </div>
      </div>

      {/* Corporate Information & Registered Depots */}
      <div id="corporate" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="space-y-1 border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Corporate Transparency & Mandi Depots
          </h2>
          <p className="text-xs text-slate-500">
            Official business registration, licensing, and physical warehouse logistics hubs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          
          {/* Legal Identity */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Statutory Legal Entity</span>
            </div>
            <div className="space-y-1 text-slate-600 dark:text-slate-400">
              <div><b>Entity:</b> VyaparHub Wholesale Technologies Pvt Ltd</div>
              <div><b>Trade Name:</b> Shree Laxmi Trading & Wholesale Hub</div>
              <div><b>CIN:</b> <span className="font-mono">U51109DL2024PTC098712</span></div>
              <div><b>GSTIN:</b> <span className="font-mono">07AAACL1234F1Z8</span></div>
              <div><b>FSSAI Lic:</b> <span className="font-mono">10019011006543</span></div>
            </div>
          </div>

          {/* Delhi Hub */}
          <div id="depots" className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>North India APMC Central Hub</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Gate No. 4, Wholesale Grain & FMCG Corridor,<br />
              Central APMC Mandi Complex, Azadpur / Delhi — 110006<br />
              <b>Capacity:</b> 25,000 Master Cartons Daily Dispatch
            </p>
            <div className="text-[11px] text-slate-500 pt-1">
              Direct rail & national highway container access.
            </div>
          </div>

          {/* Varanasi Depot */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Eastern UP Regional Depot</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Shop 14-16, Commercial Mandi Depot,<br />
              Godowlia — 221001, Varanasi, Uttar Pradesh<br />
              <b>Focus:</b> Kirana Restock for Varanasi & Surrounding Districts
            </p>
            <div className="text-[11px] text-slate-500 pt-1">
              Daily electric cargo delivery beat network.
            </div>
          </div>

        </div>

        {/* Contact Strip */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-blue-600" />
              <span className="font-mono">011-45614700</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>support@vyaparhub.com</span>
            </div>
          </div>

          <div className="text-slate-500 text-[11px]">
            Operating Hours: Monday – Saturday, 8:00 AM – 8:00 PM IST
          </div>
        </div>

      </div>

    </div>
  );
}
