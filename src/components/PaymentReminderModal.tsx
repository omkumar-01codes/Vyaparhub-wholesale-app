'use client';

import React, { useState } from 'react';
import { Customer, DealerProfile, DebtAgingSummary } from '@/lib/types';
import {
  X,
  MessageCircle,
  Clock,
  AlertTriangle,
  QrCode,
  Building2,
  CheckCircle2,
  Send,
  Copy,
  Calendar
} from 'lucide-react';

interface PaymentReminderModalProps {
  customer: Customer;
  dealer: DealerProfile;
  aging: DebtAgingSummary;
  isOpen: boolean;
  onClose: () => void;
  onReminderSent: (customerId: string, timestamp: string) => void;
}

export type ReminderTone = 'GENTLE' | 'FORMAL_STATEMENT' | 'URGENT_FREEZE';

export default function PaymentReminderModal({
  customer,
  dealer,
  aging,
  isOpen,
  onClose,
  onReminderSent
}: PaymentReminderModalProps) {
  const [tone, setTone] = useState<ReminderTone>(
    aging.overdueAmount > 0 ? 'URGENT_FREEZE' : aging.dueSoonAmount > 0 ? 'FORMAL_STATEMENT' : 'GENTLE'
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [customNote, setCustomNote] = useState<string>('');

  if (!isOpen || !customer) return null;

  // Generate UPI Deep Link for quick 1-tap payment
  const upiDeepLink = `upi://pay?pa=${dealer.upiId}&pn=${encodeURIComponent(
    dealer.upiName || dealer.businessName
  )}&am=${customer.outstandingDebt}&cu=INR&tn=${encodeURIComponent(
    `Khata Settlement ${customer.businessName}`
  )}`;

  // Construct message based on chosen tone
  const generateMessage = (): string => {
    const formattedAmt = `₹${customer.outstandingDebt.toLocaleString('en-IN')}`;
    const dateStr = new Date().toLocaleDateString('en-IN');

    if (tone === 'GENTLE') {
      return `*🙏 Namaste ${customer.name} ji (${customer.businessName})*,\n\nThis is a gentle courtesy reminder from *${dealer.businessName}* regarding your wholesale account balance.\n\n*📋 Account Summary as on ${dateStr}:*\n• Total Outstanding Balance: *${formattedAmt}*\n• Current Running Credit: ₹${aging.currentAmount.toLocaleString('en-IN')}\n\nKindly arrange the payment settlement at your earliest convenience to keep your credit limit active for upcoming orders.\n\n*💳 Instant UPI Payment Link:*\n${upiDeepLink}\n\n*Bank Account Details:*\n• Payee: ${dealer.businessName}\n• Bank: ${dealer.bankName}\n• A/C: ${dealer.bankAccount}\n• IFSC: ${dealer.ifscCode}\n• UPI ID: \`${dealer.upiId}\`\n\nThank you for your valued partnership!\n*${dealer.businessName}* | Ph: ${dealer.phone}`;
    }

    if (tone === 'FORMAL_STATEMENT') {
      return `*📋 STATEMENT OF OVERDUE ACCOUNT • ${dealer.businessName}*\n-----------------------------------------\n*To:* ${customer.businessName} (${customer.name})\n*Date:* ${dateStr}\n\nDear Partner,\nOur accounting records indicate that an outstanding debt balance of *${formattedAmt}* is due for clearance on your wholesale ledger.\n\n*Aging Breakdown:*\n• Due for Settlement: ₹${aging.dueSoonAmount.toLocaleString('en-IN')}\n• Overdue (>30 Days): ₹${aging.overdueAmount.toLocaleString('en-IN')}\n\n${customNote ? `*Wholesaler Remark:* ${customNote}\n\n` : ''}Please settle this balance via UPI or bank transfer today to avoid disruption in your next delivery schedule.\n\n*⚡ 1-Tap UPI Payment:*\n${upiDeepLink}\n\n*Bank Transfer Info:*\n• Account: ${dealer.bankAccount} (${dealer.ifscCode})\n• Bank: ${dealer.bankName}\n• UPI ID: \`${dealer.upiId}\`\n\nKindly share the UTR / payment screenshot once transferred.\nRegards,\n*Accounts & Credit Recovery Team*\n${dealer.businessName}`;
    }

    // URGENT_FREEZE tone
    return `*⚠️ URGENT: WHOLESALE CREDIT ACCOUNT SUSPENSION NOTICE*\n-----------------------------------------\n*Buyer:* ${customer.businessName} (${customer.name})\n*Wholesaler:* ${dealer.businessName}\n*Date:* ${dateStr}\n\nAttention ${customer.name} ji,\nYour wholesale account has critical overdue balance of *${formattedAmt}* pending past the 30-day credit period.\n\n*⚠️ Action Notice:*\nAs per credit policy, further dispatch of goods and order booking is on temporary hold until the overdue amount of *₹${aging.overdueAmount.toLocaleString('en-IN')}* is cleared.\n\n${customNote ? `*Note:* ${customNote}\n\n` : ''}Please execute immediate settlement via the link below to resume dispatch immediately:\n\n*🔗 Instant UPI Settlement:*\n${upiDeepLink}\n\n*A/C Transfer:* ${dealer.bankAccount} | IFSC: ${dealer.ifscCode} | UPI: \`${dealer.upiId}\`\n\nPlease send UTR transaction confirmation immediately to ${dealer.phone}.\n\n*${dealer.businessName}*`;
  };

  const currentMessage = generateMessage();

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = async () => {
    const timestamp = new Date().toISOString();
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(currentMessage)}`;

    // Open WhatsApp
    window.open(url, '_blank');

    // Notify parent to update local state and database
    onReminderSent(customer.id, timestamp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Khata Payment Reminder
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  WhatsApp & UPI
                </span>
              </div>
              <p className="text-xs text-slate-500">
                To: <span className="font-bold text-slate-800 dark:text-slate-200">{customer.businessName}</span> ({customer.phone})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Debt Snapshot Bar */}
        <div className="px-5 py-3 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-slate-500 text-[11px]">Total Outstanding:</span>
            <div className="text-base font-extrabold font-mono text-rose-600 dark:text-rose-400">
              ₹{customer.outstandingDebt.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">CURRENT</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">₹{aging.currentAmount.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-amber-500 block text-[10px] font-bold">DUE SOON</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">₹{aging.dueSoonAmount.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-rose-500 block text-[10px] font-bold">OVERDUE (&gt;30D)</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">₹{aging.overdueAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Tone Selector */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
              Select Reminder Tone & Template:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTone('GENTLE')}
                className={`p-2.5 rounded-2xl text-left border transition-all ${
                  tone === 'GENTLE'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 font-bold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-bold">Gentle Courtesy</div>
                <div className="text-[10px] opacity-75 font-normal mt-0.5">Upcoming balance</div>
              </button>

              <button
                type="button"
                onClick={() => setTone('FORMAL_STATEMENT')}
                className={`p-2.5 rounded-2xl text-left border transition-all ${
                  tone === 'FORMAL_STATEMENT'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 font-bold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-bold">Formal Statement</div>
                <div className="text-[10px] opacity-75 font-normal mt-0.5">Due for clearance</div>
              </button>

              <button
                type="button"
                onClick={() => setTone('URGENT_FREEZE')}
                className={`p-2.5 rounded-2xl text-left border transition-all ${
                  tone === 'URGENT_FREEZE'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200 font-bold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-bold">Urgent Hold</div>
                <div className="text-[10px] opacity-75 font-normal mt-0.5">Overdue &gt;30 days</div>
              </button>
            </div>
          </div>

          {/* Optional Wholesaler Remark */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 mb-1 block">
              Additional Note / Bill Reference (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Please clear bill #ORD-2026-0801 before Friday dispatch."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* WhatsApp Message Preview */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                WhatsApp Message Preview:
              </span>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200 max-h-48 overflow-y-auto">
              {currentMessage}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 text-center sm:text-left">
            {customer.lastReminderSent ? (
              <span>Last reminded: {new Date(customer.lastReminderSent).toLocaleDateString('en-IN')}</span>
            ) : (
              <span>No prior reminder recorded for this retailer.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
