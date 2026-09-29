'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { SettlementMode, Customer } from '@/lib/types';
import { X, Check, DollarSign, Wallet, FileText, CheckCircle2 } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomer?: Customer;
}

export default function RecordPaymentModal({
  isOpen,
  onClose,
  defaultCustomer
}: RecordPaymentModalProps) {
  const { customers, recordPayment, t } = useApp();
  const [selectedCustId, setSelectedCustId] = useState<string>(
    defaultCustomer?.id || customers[0]?.id || ''
  );
  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<SettlementMode>('UPI');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const currentSelectedCust = customers.find((c) => c.id === selectedCustId);
  const parsedAmount = parseFloat(amount) || 0;
  const newBalance = currentSelectedCust
    ? Math.max(0, currentSelectedCust.outstandingDebt - parsedAmount)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedCust || parsedAmount <= 0) return;

    recordPayment({
      customerId: currentSelectedCust.id,
      amount: parsedAmount,
      paymentMode,
      referenceNumber: referenceNumber || `${paymentMode}-REF-${Date.now().toString().slice(-6)}`,
      notes: notes || `Recorded by dealer (${paymentMode})`
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setAmount('');
      setReferenceNumber('');
      setNotes('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">Record Payment / Udhaar Settlement</h3>
              <p className="text-xs text-emerald-100">Update Retailer Khata Ledger Instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {success ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Payment Recorded!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ₹{parsedAmount.toLocaleString('en-IN')} credited to {currentSelectedCust?.businessName}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Customer Selector */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Select Retailer / Customer:
              </label>
              <select
                value={selectedCustId}
                onChange={(e) => setSelectedCustId(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.businessName} — Outstanding: ₹{c.outstandingDebt.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Balance Card */}
            {currentSelectedCust && (
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex justify-between items-center text-xs">
                <div>
                  <div className="text-slate-400 dark:text-slate-500 font-medium">Current Outstanding Debt:</div>
                  <div className="text-base font-extrabold text-amber-700 dark:text-amber-400 font-mono">
                    ₹{currentSelectedCust.outstandingDebt.toLocaleString('en-IN')}
                  </div>
                </div>
                {parsedAmount > 0 && (
                  <div className="text-right">
                    <div className="text-slate-400 dark:text-slate-500 font-medium">Remaining Balance:</div>
                    <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      ₹{newBalance.toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Amount */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Amount Received (₹):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 25000"
                  className="w-full text-sm font-bold pl-8 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Payment Channel:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['UPI', 'CASH', 'CHEQUE', 'BANK_TRANSFER'] as SettlementMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 px-1 text-center text-xs font-bold rounded-lg border transition-all ${
                      paymentMode === mode
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {mode === 'BANK_TRANSFER' ? 'NEFT/RTGS' : mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Reference / UTR / Cheque No. (Optional):
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. UPI-982341 or Cheque #00412"
                className="w-full text-xs font-mono p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Notes / Remarks:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Received partial payment for August stock"
                className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.98]"
            >
              <Check className="w-5 h-5" />
              Save Payment to Khata Ledger
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
