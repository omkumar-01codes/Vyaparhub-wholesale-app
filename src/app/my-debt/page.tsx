'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import UpiQrModal from '@/components/UpiQrModal';
import { exportLedgerToExcel, exportLedgerToPdf } from '@/lib/export-utils';
import {
  BookOpen,
  QrCode,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  Copy,
  FileSpreadsheet,
  Download,
  ChevronDown,
  Clock,
  ShieldAlert
} from 'lucide-react';

export default function MyDebtPage() {
  const { currentCustomer, getCustomerLedger, getCustomerAging, recordPayment, dealerProfile, t } = useApp();
  const [showPayModal, setShowPayModal] = useState(false);
  const [customPayAmount, setCustomPayAmount] = useState<number>(currentCustomer.outstandingDebt);
  const [copiedBank, setCopiedBank] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const ledgerHistory = getCustomerLedger(currentCustomer.id);
  const aging = getCustomerAging(currentCustomer.id);
  const creditUsagePercent = Math.min(
    100,
    Math.round((currentCustomer.outstandingDebt / currentCustomer.creditLimit) * 100)
  );

  const handlePaymentCompleted = (utr: string) => {
    recordPayment({
      customerId: currentCustomer.id,
      amount: customPayAmount,
      paymentMode: 'UPI',
      referenceNumber: utr,
      notes: 'Paid via Self-Service Direct UPI QR'
    });
  };

  const handleCopyBank = () => {
    const text = `A/C: ${dealerProfile.bankAccount}, IFSC: ${dealerProfile.ifscCode}, Bank: ${dealerProfile.bankName}, UPI: ${dealerProfile.upiId}`;
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              {t('myDebtBalance')} Statement
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {currentCustomer.businessName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Dealer Account with: <b className="text-white">{dealerProfile.businessName}</b>
            </p>
          </div>

          {/* Outstanding Balance Highlight Box */}
          <div className="bg-white/10 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-700 rounded-2xl p-5 text-left min-w-[280px]">
            <div className="text-xs uppercase font-bold text-slate-300">
              {t('accountBalance')}
            </div>
            <div className="text-3xl font-extrabold text-amber-400 mt-1 font-mono">
              ₹{currentCustomer.outstandingDebt.toLocaleString('en-IN')}
            </div>

            {/* Credit Limit Meter */}
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                <span>Credit Used: {creditUsagePercent}%</span>
                <span>Limit: ₹{currentCustomer.creditLimit.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full h-2 bg-white/20 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all rounded-full ${
                    creditUsagePercent > 80 ? 'bg-rose-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${creditUsagePercent}%` }}
                />
              </div>
            </div>

            {/* Action to Pay Balance */}
            {currentCustomer.outstandingDebt > 0 ? (
              <button
                onClick={() => {
                  setCustomPayAmount(currentCustomer.outstandingDebt);
                  setShowPayModal(true);
                }}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <QrCode className="w-4 h-4" />
                Pay Outstanding via UPI QR
              </button>
            ) : (
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-emerald-300 font-semibold bg-emerald-900/40 py-2 rounded-xl border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                All Accounts Settled (Zero Debt)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Problem 3: Retailer's Debt Aging Breakdown */}
      {currentCustomer.outstandingDebt > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Current (0–15 Days)</div>
              <div className="text-lg font-bold text-emerald-600 font-mono">
                ₹{aging.currentAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/60 p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Due Soon (16–30 Days)</div>
              <div className="text-lg font-bold text-amber-600 font-mono">
                ₹{aging.dueSoonAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-rose-500 font-bold">Overdue (&gt;30 Days)</div>
              <div className="text-lg font-bold text-rose-600 font-mono">
                ₹{aging.overdueAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dealer Settlement Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Dealer Bank & UPI Payment Details
            </h3>
            <button
              onClick={handleCopyBank}
              className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedBank ? 'Copied Details' : 'Copy All'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold">UPI ID (0% Fees)</div>
              <div className="font-mono font-bold text-blue-700 dark:text-blue-400 mt-0.5">{dealerProfile.upiId}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold">Account Name</div>
              <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{dealerProfile.upiName}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold">Bank & IFSC</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">
                {dealerProfile.ifscCode}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold">Account Number</div>
              <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">
                {dealerProfile.bankAccount}
              </div>
            </div>
          </div>
        </div>

        {/* Khata Rules */}
        <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              Transparent Ledger & Credit Terms
            </h3>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-1.5 leading-relaxed">
              Every wholesale purchase made on credit is timestamped below. As soon as you make a payment via UPI QR, Cash, or NEFT, the balance automatically reduces in real time.
            </p>
          </div>
          <div className="mt-3 text-[11px] font-semibold text-amber-900 dark:text-amber-200 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/50">
            💡 <b>Pro-Tip:</b> Clear bills within 15 days to maintain a clean aging score and qualify for higher credit limits.
          </div>
        </div>
      </div>

      {/* Ledger Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/60">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Transaction History (Debit & Credit Statement)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detailed chronological record of purchases and debt payments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Button */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('exportData')}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in">
                  <button
                    onClick={() => {
                      void exportLedgerToExcel(ledgerHistory, currentCustomer.businessName, `${currentCustomer.businessName}_Khata.xlsx`);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('exportExcel')}</span>
                  </button>
                  <button
                    onClick={() => {
                      exportLedgerToPdf(ledgerHistory, currentCustomer.businessName, dealerProfile);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t('exportPdf')}</span>
                  </button>
                </div>
              )}
            </div>

            <span className="text-xs font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg">
              {ledgerHistory.length} Entries
            </span>
          </div>
        </div>

        {ledgerHistory.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No transactions found in your ledger.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Transaction Type</th>
                  <th className="p-3.5">Mode / Ref #</th>
                  <th className="p-3.5">Details & Remarks</th>
                  <th className="p-3.5 text-right">Debit (+ ₹)</th>
                  <th className="p-3.5 text-right">Credit (- ₹)</th>
                  <th className="p-3.5 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {ledgerHistory.map((entry) => {
                  const isDebit = entry.type === 'DEBIT_ORDER';

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors">
                      <td className="p-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono">
                        {new Date(entry.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        {isDebit ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800 font-bold text-[11px]">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Order Purchase
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-bold text-[11px]">
                            <ArrowDownRight className="w-3.5 h-3.5" /> Payment Received
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">
                          {entry.paymentMode}
                        </span>
                        {entry.referenceNumber && (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {entry.referenceNumber}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-600 dark:text-slate-400">{entry.notes || '-'}</td>

                      <td className="p-3.5 text-right font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                        {isDebit ? `+ ₹${entry.amount.toLocaleString('en-IN')}` : '-'}
                      </td>

                      <td className="p-3.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                        {!isDebit ? `- ₹${entry.amount.toLocaleString('en-IN')}` : '-'}
                      </td>

                      <td className="p-3.5 text-right font-extrabold text-slate-900 dark:text-white font-mono">
                        ₹{entry.runningBalance.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPI QR Payment Modal */}
      <UpiQrModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        amount={customPayAmount}
        onPaymentComplete={handlePaymentCompleted}
        title="Pay Outstanding Debt"
      />
    </div>
  );
}
