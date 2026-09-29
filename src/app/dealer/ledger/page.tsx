'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Customer } from '@/lib/types';
import RecordPaymentModal from '@/components/RecordPaymentModal';
import PaymentReminderModal from '@/components/PaymentReminderModal';
import { exportLedgerToExcel, exportLedgerToPdf } from '@/lib/export-utils';
import {
  BookOpen,
  DollarSign,
  Search,
  MessageCircle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Building2,
  Phone,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  ChevronDown,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Send,
  BellRing
} from 'lucide-react';

export default function DealerLedgerPage() {
  const { customers, ledgerEntries, dealerProfile, getCustomerAging, t } = useApp();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [activeCustomerForPayment, setActiveCustomerForPayment] = useState<Customer | undefined>(
    undefined
  );
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Payment Reminder Modal States
  const [selectedCustomerForReminder, setSelectedCustomerForReminder] = useState<Customer | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);

  const totalMarketDebt = customers.reduce((sum, c) => sum + c.outstandingDebt, 0);

  // Compute aggregate debt aging across all retailers
  const aggregateAging = customers.reduce(
    (acc, cust) => {
      const aging = getCustomerAging(cust.id);
      acc.current += aging.currentAmount;
      acc.dueSoon += aging.dueSoonAmount;
      acc.overdue += aging.overdueAmount;
      return acc;
    },
    { current: 0, dueSoon: 0, overdue: 0 }
  );

  // Filter customers
  const filteredCustomers = customers.filter(
    (c) =>
      c.businessName.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  // Filter ledger entries
  const filteredLedger = ledgerEntries.filter((entry) => {
    if (selectedCustomerId !== 'ALL' && entry.customerId !== selectedCustomerId) {
      return false;
    }
    return true;
  });

  const handleOpenRecordPayment = (cust?: Customer) => {
    setActiveCustomerForPayment(cust);
    setIsRecordModalOpen(true);
  };

  const handleOpenReminder = (cust: Customer) => {
    setSelectedCustomerForReminder(cust);
    setIsReminderModalOpen(true);
  };

  const handleReminderSent = async (customerId: string, timestamp: string) => {
    try {
      await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customerId, lastReminderSent: timestamp })
      });
      // Update local state if needed
      const target = customers.find((c) => c.id === customerId);
      if (target) {
        target.lastReminderSent = timestamp;
      }
    } catch (e) {
      console.warn('Error saving reminder timestamp:', e);
    }
  };

  const activeCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-900/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            Master Debt & Khata Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Retailer Credit & Udhaar Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Track retailer credit limits, overdue aging risk buckets, and send 1-click WhatsApp payment statements.
          </p>
        </div>

        <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-700 rounded-2xl p-4 min-w-[240px] text-left">
          <div className="text-[11px] uppercase font-bold text-amber-200">
            Total Outstanding Market Debt
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-1 font-mono">
            ₹{totalMarketDebt.toLocaleString('en-IN')}
          </div>
          <button
            onClick={() => handleOpenRecordPayment()}
            className="mt-3 w-full flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs shadow-md transition-all active:scale-95"
          >
            <DollarSign className="w-4 h-4" />
            + Record Payment Received
          </button>
        </div>
      </div>

      {/* Problem 3: Debt Aging Risk Buckets Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Bucket 1: 0 - 15 Days */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Current (0–15 Days) • Healthy
            </div>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              ₹{aggregateAging.current.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Bucket 2: 16 - 30 Days */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/60 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Due Soon (16–30 Days)
            </div>
            <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
              ₹{aggregateAging.dueSoon.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Bucket 3: > 30 Days */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-rose-500 font-bold">
              Overdue (&gt; 30 Days) • High Risk
            </div>
            <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-0.5">
              ₹{aggregateAging.overdue.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Debt Recovery Action Hub */}
      {aggregateAging.overdue > 0 && (
        <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 dark:from-rose-950/40 dark:via-amber-950/30 dark:to-slate-900 p-4 sm:p-5 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Debt Recovery Action Hub
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                  Critical Overdue
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Total Overdue (&gt;30 Days): <strong className="text-rose-600 dark:text-rose-400 font-mono">₹{aggregateAging.overdue.toLocaleString('en-IN')}</strong>. Send automated WhatsApp statements with direct UPI payment links.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const topOverdue = customers
                .filter((c) => getCustomerAging(c.id).overdueAmount > 0)
                .sort((a, b) => getCustomerAging(b.id).overdueAmount - getCustomerAging(a.id).overdueAmount)[0];
              if (topOverdue) handleOpenReminder(topOverdue);
            }}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Remind Top Overdue Debtor</span>
          </button>
        </div>
      )}

      {/* Retailer Customer Cards */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            Retailer Accounts & Balances ({customers.length})
          </h2>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('exportData')}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in">
                <button
                  onClick={() => {
                    void exportLedgerToExcel(
                      filteredLedger,
                      activeCustomerObj ? activeCustomerObj.businessName : 'All_Accounts',
                      'Dealer_Khata_Ledger.xlsx'
                    );
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('exportExcel')}</span>
                </button>
                <button
                  onClick={() => {
                    exportLedgerToPdf(
                      filteredLedger,
                      activeCustomerObj ? activeCustomerObj.businessName : 'All Retailers',
                      dealerProfile
                    );
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => {
            const isSelected = selectedCustomerId === cust.id;
            const usagePercent = Math.min(
              100,
              Math.round((cust.outstandingDebt / cust.creditLimit) * 100)
            );
            const aging = getCustomerAging(cust.id);

            return (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomerId(isSelected ? 'ALL' : cust.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 ring-2 ring-amber-400 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {cust.businessName}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {cust.name} • {cust.city}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                      {cust.phone}
                    </div>
                  </div>

                  {/* Overdue Alert Badge */}
                  {aging.hasOverdue ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1 shrink-0">
                      <ShieldAlert className="w-3 h-3 text-rose-600" /> &gt;30d Overdue
                    </span>
                  ) : cust.outstandingDebt > 0 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 shrink-0">
                      Active Debt
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                      Clear
                    </span>
                  )}
                </div>

                {/* Balance & Progress */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                      Outstanding:
                    </span>
                    <span className="text-base font-extrabold text-amber-700 dark:text-amber-400 font-mono">
                      ₹{cust.outstandingDebt.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Credit Bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium mb-1">
                      <span>Limit: ₹{cust.creditLimit.toLocaleString('en-IN')}</span>
                      <span>{usagePercent}% Used</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          usagePercent > 75 ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Aging Breakdown Pills */}
                  {cust.outstandingDebt > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                        0-15d: ₹{(aging.currentAmount / 1000).toFixed(0)}k
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-mono">
                        16-30d: ₹{(aging.dueSoonAmount / 1000).toFixed(0)}k
                      </span>
                      <span className={`${aging.overdueAmount > 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-400'} font-mono`}>
                        30d+: ₹{(aging.overdueAmount / 1000).toFixed(0)}k
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRecordPayment(cust);
                      }}
                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Record Pay</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenReminder(cust);
                      }}
                      className="py-1.5 px-3 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      title="Send WhatsApp Payment Reminder & Statement"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Reminder</span>
                    </button>
                  </div>

                  {cust.lastReminderSent && (
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-emerald-500" />
                      <span>Last reminded: {new Date(cust.lastReminderSent).toLocaleDateString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History Statement */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/60">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Master Ledger Audit Trail
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedCustomerId === 'ALL'
                ? 'Showing all transactions across all retailers'
                : `Filtered by ${
                    customers.find((c) => c.id === selectedCustomerId)?.businessName
                  }`}
            </p>
          </div>

          {selectedCustomerId !== 'ALL' && (
            <button
              onClick={() => setSelectedCustomerId('ALL')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-lg"
            >
              Show All Accounts
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Retailer / Business</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Payment Mode / Ref</th>
                <th className="p-3.5">Remarks</th>
                <th className="p-3.5 text-right">Debit (+ ₹)</th>
                <th className="p-3.5 text-right">Credit (- ₹)</th>
                <th className="p-3.5 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {filteredLedger.map((entry) => {
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
                      <div className="font-bold text-slate-900 dark:text-white">{entry.businessName}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">{entry.customerName}</div>
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
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
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
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        defaultCustomer={activeCustomerForPayment}
      />

      {/* WhatsApp Payment Reminder Modal */}
      {selectedCustomerForReminder && (
        <PaymentReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          customer={selectedCustomerForReminder}
          dealer={dealerProfile}
          aging={getCustomerAging(selectedCustomerForReminder.id)}
          onReminderSent={handleReminderSent}
        />
      )}
    </div>
  );
}
