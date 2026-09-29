'use client';

import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  HelpCircle,
  CreditCard,
  Bike,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  FileText,
  Truck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '@/lib/store';

export default function Footer() {
  const { openAuthModal } = useApp();

  return (
    <footer className="bg-[#172337] dark:bg-slate-950 text-slate-300 text-xs border-t border-slate-700/60 mt-auto selection:bg-blue-600 selection:text-white">
      {/* Top 5-Column Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6">
          
          {/* Col 1: ABOUT */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              ABOUT
            </h4>
            <ul className="space-y-2 text-[12px] font-medium text-slate-300">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About VyaparHub
                </Link>
              </li>
              <li>
                <Link href="/about#mission" className="hover:text-white transition-colors">
                  Wholesale Mission
                </Link>
              </li>
              <li>
                <Link href="/about#pillars" className="hover:text-white transition-colors">
                  4 Core Pillars
                </Link>
              </li>
              <li>
                <Link href="/about#corporate" className="hover:text-white transition-colors">
                  Corporate Information
                </Link>
              </li>
              <li>
                <a
                  href="mailto:partners@vyaparhub.com"
                  className="hover:text-white transition-colors"
                >
                  FMCG Mill Network
                </a>
              </li>
              <li>
                <Link href="/about#depots" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: WHOLESALE HUBS */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              WHOLESALE HUBS
            </h4>
            <ul className="space-y-2 text-[12px] font-medium text-slate-300">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Delhi Central APMC Hub
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Varanasi Mandi Depot
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Gujarat Oil & Pulses Line
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Bengal Direct Rice Depot
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  FastLogistics Fleet
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: HELP & GUIDES */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              HELP
            </h4>
            <ul className="space-y-2 text-[12px] font-medium text-slate-300">
              <li>
                <Link href="/help" className="hover:text-white transition-colors font-bold text-amber-300">
                  Full Platform Guide
                </Link>
              </li>
              <li>
                <Link href="/help#kirana-guide" className="hover:text-white transition-colors">
                  How Kirana Orders Work
                </Link>
              </li>
              <li>
                <Link href="/help#khata-guide" className="hover:text-white transition-colors">
                  Khata Credit Line & Dues
                </Link>
              </li>
              <li>
                <Link href="/help#dealer-guide" className="hover:text-white transition-colors">
                  Wholesale Dealer Center
                </Link>
              </li>
              <li>
                <Link href="/help#sales-guide" className="hover:text-white transition-colors">
                  Field Salesman Beat Guide
                </Link>
              </li>
              <li>
                <Link href="/help#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: CONSUMER & B2B POLICY */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              CONSUMER POLICY
            </h4>
            <ul className="space-y-2 text-[12px] font-medium text-slate-300">
              <li>
                <Link href="/refund" className="hover:text-white transition-colors">
                  Cancellation &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms Of B2B Trade
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/help#security-guide" className="hover:text-white transition-colors">
                  Security & JWT Encryption
                </Link>
              </li>
              <li>
                <Link href="/help#tax-guide" className="hover:text-white transition-colors">
                  Dual GST & E-Way Bill Rule 138
                </Link>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  FSSAI Food Safety Connect
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  EPR Environmental Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Col 5 & 6: Contact & Registered Office Address (with Vertical Border Divider) */}
          <div className="lg:col-span-2 lg:border-l lg:border-slate-700/80 lg:pl-6 space-y-4 pt-4 lg:pt-0 border-t border-slate-700/60 lg:border-t-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] leading-relaxed">
              
              {/* Mail Us */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-black uppercase text-slate-400 block tracking-wider">
                  Mail Us:
                </span>
                <p className="text-slate-300">
                  VyaparHub Wholesale Technologies Pvt Ltd,<br />
                  Central APMC Trading Mandi Complex,<br />
                  Gate No. 4, Wholesale Grain Corridor,<br />
                  Delhi — 110006, India
                </p>
                <div className="pt-2 text-slate-400 text-[10px]">
                  <span>Email: </span>
                  <a href="mailto:support@vyaparhub.com" className="text-blue-400 hover:underline">
                    support@vyaparhub.com
                  </a>
                </div>
              </div>

              {/* Registered Office Address */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-black uppercase text-slate-400 block tracking-wider">
                  Registered Office Address:
                </span>
                <p className="text-slate-300">
                  Shree Laxmi Trading & Wholesale Hub,<br />
                  Shop 14-16, Godowlia Commercial Depot,<br />
                  Varanasi — 221001, Uttar Pradesh, India
                </p>
                <p className="text-[10px] text-slate-400 pt-1">
                  CIN: <span className="font-mono text-slate-300">U51109DL2024PTC098712</span><br />
                  GSTIN: <span className="font-mono text-slate-300">07AAACL1234F1Z8</span><br />
                  FSSAI: <span className="font-mono text-slate-300">10019011006543</span>
                </p>
                <p className="text-[10px] text-slate-400">
                  Telephone: <a href="tel:01145614700" className="text-blue-400 font-mono">011-45614700</a> / <a href="tel:919811122334" className="text-blue-400 font-mono">+91 98111 22334</a>
                </p>
              </div>
            </div>

            {/* Social Icons */}
            <div className="pt-2 border-t border-slate-700/40 flex items-center gap-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Social:</span>
              <div className="flex items-center gap-3 text-slate-300">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                  aria-label="Twitter / X"
                >
                  <Twitter className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-red-600 flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-pink-600 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Action Sub-Footer Bar */}
      <div className="border-t border-slate-800 bg-[#121b2b] dark:bg-black py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Quick Feature Badges with Gold / Amber icons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-[11px] font-bold text-slate-300">
            <button
              onClick={() => openAuthModal('REGISTER')}
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>Become a Wholesale Partner</span>
            </button>

            <Link
              href="/sales"
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
            >
              <Bike className="w-4 h-4 text-amber-400" />
              <span>Salesman Beat Portal</span>
            </Link>

            <button
              onClick={() => openAuthModal('REGISTER')}
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Verified Khata Credit Line</span>
            </button>

            <Link
              href="/help"
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Help Center & Guide</span>
            </Link>
          </div>

          {/* Copyright Notice */}
          <div className="text-[11px] text-slate-400 text-center">
            © 2024–2026 VyaparHub Wholesale Technologies Pvt Ltd.
          </div>

          {/* Payment & Banking Badges */}
          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto max-w-full pb-1 lg:pb-0">
            <span className="px-2 py-0.5 rounded bg-white text-blue-900 font-extrabold text-[9px] tracking-tight border border-slate-200 shadow-xs">
              VISA
            </span>
            <span className="px-2 py-0.5 rounded bg-white text-orange-600 font-extrabold text-[9px] tracking-tight border border-slate-200 shadow-xs">
              Mastercard
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-700 text-white font-extrabold text-[9px] tracking-tight border border-blue-600 shadow-xs">
              RuPay
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-black text-[9px] tracking-tight border border-emerald-600 shadow-xs flex items-center gap-0.5">
              <span>UPI</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-bold text-[9px] border border-slate-700">
              NetBanking
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-bold text-[9px] border border-slate-700">
              NEFT / RTGS
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/30">
              Khata 30D
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}
