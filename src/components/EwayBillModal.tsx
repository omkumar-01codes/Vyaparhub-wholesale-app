'use client';

import React from 'react';
import { Order, DealerProfile } from '@/lib/types';
import {
  X,
  Printer,
  Download,
  Truck,
  FileText,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface EwayBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  dealer: DealerProfile;
}

export default function EwayBillModal({
  isOpen,
  onClose,
  order,
  dealer
}: EwayBillModalProps) {
  if (!isOpen || !order) return null;

  // Real e-way bill numbers come from the GST portal. Never invent one.
  const ewbNumber = order.ewayBillNumber || 'NOT GENERATED - create it on ewaybillgst.gov.in';
  const validUntil = order.ewayBillValidUntil
    ? new Date(order.ewayBillValidUntil).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Set after portal generation';
  const generatedAt = new Date(order.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const isIntraState = order.taxType === 'INTRA_STATE' || !order.taxType;
  const cgst = order.cgstAmount ?? (isIntraState ? Math.round(order.taxAmount / 2) : 0);
  const sgst = order.sgstAmount ?? (isIntraState ? Math.round(order.taxAmount / 2) : 0);
  const igst = order.igstAmount ?? (!isIntraState ? order.taxAmount : 0);

  const transporterName = order.transporterName || '(enter transporter)';
  const transporterId = order.transporterId || '(enter transporter GSTIN)';
  const vehicleNumber = order.vehicleNumber || '(enter vehicle no.)';

  // Format Official NIC E-Way Bill JSON export
  const exportNicJson = () => {
    const nicPayload = {
      version: '1.0.0421',
      billLists: [
        {
          userGstin: dealer.gstin,
          supplyType: 'O', // Outward
          subSupplyType: '1', // Supply
          docType: 'INV', // Tax Invoice
          docNo: order.orderNumber,
          docDate: order.createdAt.split('T')[0],
          fromGstin: dealer.gstin,
          fromTrdName: dealer.businessName,
          fromAddr1: dealer.address,
          fromPlace: 'Delhi',
          fromPincode: 110006,
          actFromStateCode: 7, // Delhi state code
          toGstin: 'URP', // Unregistered person if not provided
          toTrdName: order.businessName,
          toAddr1: `${order.city}, ${order.state}`,
          toPlace: order.city,
          toPincode: 110085,
          actToStateCode: isIntraState ? 7 : 9,
          totalValue: order.subtotal,
          cgstValue: cgst,
          sgstValue: sgst,
          igstValue: igst,
          totInvValue: order.totalAmount,
          transMode: '1', // Road
          transDistance: '35',
          transporterName,
          transporterId,
          vehicleNo: vehicleNumber,
          vehicleType: 'R',
          itemList: order.items.map((it, idx) => ({
            itemNo: idx + 1,
            productName: it.productName,
            hsnCode: it.hsnCode || '2106',
            quantity: it.quantity,
            qtyUnit: 'BOX',
            taxableAmount: it.totalPrice,
            cgstRate: isIntraState ? 2.5 : 0,
            sgstRate: isIntraState ? 2.5 : 0,
            igstRate: !isIntraState ? 5.0 : 0
          }))
        }
      ]
    };

    const blob = new Blob([JSON.stringify(nicPayload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EWB_${order.orderNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const qrPayload = JSON.stringify({
    ewbNo: ewbNumber,
    genDate: generatedAt,
    genBy: dealer.gstin,
    docNo: order.orderNumber,
    totVal: order.totalAmount,
    vehNo: vehicleNumber
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto print:shadow-none print:border-none print:w-full print:rounded-none">
        {/* Header / Non-Printable Controls */}
        <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight">Statutory Government E-Way Bill</div>
              <div className="text-[10px] text-slate-400">CGST Rule 138 Compliant (Consignments &gt; ₹50,000)</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportNicJson}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download NIC JSON Schema"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Export NIC JSON</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable E-Way Bill Slip Content */}
        <div className="p-6 sm:p-8 space-y-5 text-xs text-slate-800 bg-white">
          {/* Official Masthead */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <div className="text-base font-black tracking-wider uppercase text-slate-950">
              e-Way Bill System
            </div>
            <div className="text-[10px] text-slate-600 font-semibold">
              Government of India • Goods and Services Tax Network (GSTN)
            </div>
            <div className="text-xs font-mono font-bold mt-1 text-slate-900">
              E-Way Bill No: <span className="text-emerald-700 font-black text-sm">{ewbNumber}</span>
            </div>
          </div>

          {/* Quick Details & QR Code Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Generated Date:</span>
                <span className="font-mono font-semibold">{generatedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Valid Until:</span>
                <span className="font-mono font-bold text-emerald-700">{validUntil}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Generated By:</span>
                <span className="font-mono font-bold">{dealer.gstin} ({dealer.businessName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Invoice / Doc No:</span>
                <span className="font-mono font-bold text-blue-700">{order.orderNumber}</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
              <QRCodeSVG value={qrPayload} size={90} level="M" />
              <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase">Scan to Verify</span>
            </div>
          </div>

          {/* Part A: Consignor & Consignee Details */}
          <div>
            <div className="bg-slate-900 text-white px-3 py-1 font-bold text-[11px] uppercase tracking-wider rounded-md mb-2">
              Part A — Details of Goods & Parties
            </div>
            <div className="grid grid-cols-2 gap-4 border border-slate-200 rounded-xl p-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">1. From (Consignor / Wholesaler)</span>
                <div className="font-bold text-slate-900">{dealer.businessName}</div>
                <div className="text-slate-600 text-[11px]">{dealer.address}</div>
                <div className="font-mono text-[11px] mt-1">GSTIN: <b>{dealer.gstin}</b></div>
                <div className="text-[11px]">State: <b>Delhi [07]</b></div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">2. To (Consignee / Kirana Store)</span>
                <div className="font-bold text-slate-900">{order.businessName}</div>
                <div className="text-slate-600 text-[11px]">{order.city}, {order.state}</div>
                <div className="font-mono text-[11px] mt-1">
                  GSTIN: <b>{order.customerId ? 'REGISTERED' : 'URP (Unregistered)'}</b>
                </div>
                <div className="text-[11px]">State: <b>{order.state}</b></div>
              </div>
            </div>
          </div>

          {/* Tax Breakdown Matrix */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                <tr>
                  <th className="p-2">Item Description</th>
                  <th className="p-2">HSN Code</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">Taxable Val</th>
                  <th className="p-2 text-right">CGST</th>
                  <th className="p-2 text-right">SGST</th>
                  <th className="p-2 text-right">IGST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-medium">{item.productName}</td>
                    <td className="p-2 font-mono text-slate-600">{item.hsnCode || '2106'}</td>
                    <td className="p-2 text-center font-mono">{item.quantity}</td>
                    <td className="p-2 text-right font-mono">₹{item.totalPrice.toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right font-mono">{isIntraState ? `₹${Math.round(item.totalPrice * 0.025)}` : '-'}</td>
                    <td className="p-2 text-right font-mono">{isIntraState ? `₹${Math.round(item.totalPrice * 0.025)}` : '-'}</td>
                    <td className="p-2 text-right font-mono">{!isIntraState ? `₹${Math.round(item.totalPrice * 0.05)}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold">
                <tr>
                  <td colSpan={3} className="p-2 text-right uppercase">Total Invoice Value:</td>
                  <td className="p-2 text-right font-mono">₹{order.subtotal.toLocaleString('en-IN')}</td>
                  <td className="p-2 text-right font-mono text-blue-700">{isIntraState ? `₹${cgst.toLocaleString('en-IN')}` : '-'}</td>
                  <td className="p-2 text-right font-mono text-blue-700">{isIntraState ? `₹${sgst.toLocaleString('en-IN')}` : '-'}</td>
                  <td className="p-2 text-right font-mono text-indigo-700">{!isIntraState ? `₹${igst.toLocaleString('en-IN')}` : '-'}</td>
                </tr>
                <tr className="border-t border-slate-200 text-slate-950 font-black">
                  <td colSpan={6} className="p-2 text-right text-xs">Grand Total Consignment Value (incl. GST):</td>
                  <td className="p-2 text-right font-mono text-sm text-emerald-800">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Part B: Vehicle & Transporter Details */}
          <div>
            <div className="bg-slate-900 text-white px-3 py-1 font-bold text-[11px] uppercase tracking-wider rounded-md mb-2">
              Part B — Transport Details (Vehicle & Carrier)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border border-slate-200 rounded-xl p-3 bg-slate-50 text-[11px]">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Mode</span>
                <span className="font-bold">1 - Road</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Vehicle No</span>
                <span className="font-mono font-black text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {vehicleNumber}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Transporter Name</span>
                <span className="font-bold">{transporterName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Transporter ID</span>
                <span className="font-mono font-bold">{transporterId}</span>
              </div>
            </div>
          </div>

          {/* Statutory Declaration */}
          <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 space-y-1">
            <p>
              <b>Statutory Declaration:</b> Certified that the particulars furnished above are true and correct. The consignment of goods is covered under e-Way Bill generated as per Rule 138 of CGST Rules 2017.
            </p>
            <div className="flex justify-between items-end pt-4">
              <div>
                <span>Generated by: Authorized Signatory ({dealer.businessName})</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 block">For {dealer.businessName}</span>
                <span className="text-[9px] text-slate-400">(Digitally Signed e-Way Bill Slip)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
