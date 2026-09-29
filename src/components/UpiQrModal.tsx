'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '@/lib/store';
import { X, Copy, Check, QrCode, ShieldCheck, ArrowRight, Smartphone, AlertCircle, FileCheck } from 'lucide-react';

interface UpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentComplete: (utrNumber: string, proofNote?: string) => void;
  title?: string;
}

export default function UpiQrModal({
  isOpen,
  onClose,
  amount,
  onPaymentComplete,
  title = 'Scan & Pay via Direct UPI'
}: UpiQrModalProps) {
  const { dealerProfile } = useApp();
  const [copied, setCopied] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [proofNote, setProofNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Standard UPI URI scheme: upi://pay?pa=...&pn=...&am=...&cu=INR
  const upiUrl = `upi://pay?pa=${encodeURIComponent(
    dealerProfile.upiId
  )}&pn=${encodeURIComponent(dealerProfile.upiName)}&am=${amount}&cu=INR`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(dealerProfile.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const generatedUtr = utrInput.trim() || `UPI-TXN-${Date.now().toString().slice(-8)}`;
      onPaymentComplete(generatedUtr, proofNote.trim() || undefined);
      setIsProcessing(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">{title}</h3>
              <p className="text-xs text-blue-200">0% Gateway Fees • Direct Bank Credit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-center">
          {/* Amount Badge */}
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Payable Amount
            </span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-mono">
              ₹{amount.toLocaleString('en-IN')}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="inline-block p-4 bg-white rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-md mb-3">
            <QRCodeSVG
              value={upiUrl}
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Supported Apps */}
          <div className="flex items-center justify-center gap-2 mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Scan with <b>GPay</b>, <b>PhonePe</b>, <b>Paytm</b>, or any <b>Bank UPI</b></span>
          </div>

          {/* Dealer Payee Info & Copy Button */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-left mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Dealer Payee</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{dealerProfile.upiName}</div>
                <div className="text-xs font-mono text-blue-700 dark:text-blue-400 font-semibold mt-0.5">
                  {dealerProfile.upiId}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Verification Warning Notice */}
          <div className="p-2.5 mb-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 text-left flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <b>Payment Verification Required:</b> After transferring, enter your 12-digit UTR or Transaction Ref so the dealer can verify against their bank SMS before dispatching.
            </div>
          </div>

          {/* UTR & Sender Proof Details */}
          <div className="space-y-2.5 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                UPI Reference / UTR Number (12 digits):
              </label>
              <input
                type="text"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                placeholder="e.g. 423984719283"
                className="w-full text-xs font-mono px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Sender UPI ID / Bank Name (Optional proof note):
              </label>
              <input
                type="text"
                value={proofNote}
                onChange={(e) => setProofNote(e.target.value)}
                placeholder="e.g. Paid from HDFC A/C or gupta@oksbi"
                className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/25 transition-all active:scale-[0.98] mt-3"
            >
              <FileCheck className="w-5 h-5" />
              {isProcessing ? 'Submitting...' : 'Submit Payment for Verification'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
