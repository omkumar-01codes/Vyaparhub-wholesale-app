import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, LedgerEntry, DealerProfile } from './types';

function saveBuffer(buffer: ArrayBuffer, filename: string, mime: string) {
  const blob = new Blob([buffer], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function saveSheet(rows: Record<string, unknown>[], sheetName: string, filename: string) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  if (rows.length > 0) {
    sheet.columns = Object.keys(rows[0]).map((key) => ({ header: key, key, width: Math.min(32, Math.max(12, key.length + 4)) }));
    sheet.addRows(rows);
    sheet.getRow(1).font = { bold: true };
  }
  const buffer = await workbook.xlsx.writeBuffer();
  saveBuffer(buffer as ArrayBuffer, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

// Export Orders to Excel (.xlsx)
export async function exportOrdersToExcel(orders: Order[], filename = 'VyaparHub_Orders.xlsx') {
  const rows = orders.map((o) => ({
    'Order Number': o.orderNumber,
    'Retailer Business': o.businessName,
    'Contact Person': o.customerName,
    Phone: o.customerPhone,
    Location: `${o.city}, ${o.state}`,
    'Items Count': o.items.length,
    'Subtotal (₹)': o.subtotal,
    'GST Tax (₹)': o.taxAmount,
    'Discount (₹)': o.discountAmount,
    'Total Amount (₹)': o.totalAmount,
    'Payment Mode': o.paymentMode,
    'Payment Status': o.paymentStatus,
    'Fulfillment Status': o.orderStatus,
    'Order Date': new Date(o.createdAt).toLocaleDateString('en-IN')
  }));
  await saveSheet(rows, 'Orders', filename);
}

// Export Ledger (Khata) to Excel (.xlsx)
export async function exportLedgerToExcel(
  entries: LedgerEntry[],
  _title = 'Khata_Statement',
  filename = 'VyaparHub_Khata_Ledger.xlsx'
) {
  const rows = entries.map((e) => ({
    Date: new Date(e.date).toLocaleDateString('en-IN'),
    'Retailer Name': e.customerName,
    'Business Name': e.businessName,
    'Transaction Type': e.type === 'DEBIT_ORDER' ? 'Order (Debit)' : 'Payment (Credit)',
    'Payment Channel': e.paymentMode,
    'Reference / UTR': e.referenceNumber || '-',
    'Remarks / Notes': e.notes || '-',
    'Debit Amount (₹)': e.type === 'DEBIT_ORDER' ? e.amount : 0,
    'Credit Amount (₹)': e.type === 'CREDIT_PAYMENT' ? e.amount : 0,
    'Running Balance (₹)': e.runningBalance
  }));
  await saveSheet(rows, 'Khata Ledger', filename);
}

// Export Orders to PDF Table
export function exportOrdersToPdf(orders: Order[], dealer: DealerProfile) {
  const doc = new jsPDF('landscape');

  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, 297, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${dealer.businessName} — Master Orders Report`, 14, 15);

  doc.setFontSize(9);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 280, 15, { align: 'right' });

  const tableData = orders.map((o, idx) => [
    idx + 1,
    o.orderNumber,
    o.businessName,
    `${o.city}, ${o.state}`,
    new Date(o.createdAt).toLocaleDateString('en-IN'),
    o.paymentMode === 'CREDIT_DEBT' ? 'Credit (Udhaar)' : o.paymentMode,
    o.orderStatus,
    `₹${o.totalAmount.toLocaleString('en-IN')}`
  ]);

  autoTable(doc, {
    startY: 30,
    head: [['#', 'Order ID', 'Retailer Business', 'Location', 'Date', 'Payment', 'Status', 'Total (₹)']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5 }
  });

  doc.save('Orders_Report.pdf');
}

// Export Khata Ledger to PDF Table
export function exportLedgerToPdf(entries: LedgerEntry[], customerName: string, dealer: DealerProfile) {
  const doc = new jsPDF('portrait');

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${dealer.businessName}`, 14, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Khata Statement for: ${customerName}`, 14, 20);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 196, 20, { align: 'right' });

  const tableData = entries.map((e, idx) => [
    idx + 1,
    new Date(e.date).toLocaleDateString('en-IN'),
    e.type === 'DEBIT_ORDER' ? 'Order Purchase' : 'Payment Received',
    e.paymentMode,
    e.type === 'DEBIT_ORDER' ? `+ ₹${e.amount.toLocaleString('en-IN')}` : '-',
    e.type === 'CREDIT_PAYMENT' ? `- ₹${e.amount.toLocaleString('en-IN')}` : '-',
    `₹${e.runningBalance.toLocaleString('en-IN')}`
  ]);

  autoTable(doc, {
    startY: 34,
    head: [['#', 'Date', 'Type', 'Mode / Ref', 'Debit (+)', 'Credit (-)', 'Balance (₹)']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5 }
  });

  doc.save(`Khata_Statement_${customerName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}
