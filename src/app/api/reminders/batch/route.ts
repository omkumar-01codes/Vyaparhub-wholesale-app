import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireSession, handleError } from '@/lib/guard';

// Dealer-only: builds WhatsApp statements + UPI deep links for every customer with dues.
export async function POST(req: Request) {
  try {
    const auth = await requireSession(req, ['DEALER']);
    if ('error' in auth) return auth.error;

    const dealerProfile = await prisma.dealerProfile.findUnique({ where: { id: 'dealer-main' } });
    const vpa = encodeURIComponent(dealerProfile?.upiId || '');
    const payeeName = encodeURIComponent(dealerProfile?.upiName || dealerProfile?.businessName || '');

    const customersWithDebt = await prisma.customer.findMany({ where: { outstandingDebt: { gt: 0 } } });
    const nowIso = new Date().toISOString();
    const batch = [];

    for (const cust of customersWithDebt) {
      const note = encodeURIComponent(`Khata Due ${cust.businessName}`.slice(0, 60));
      const upiDeepLink = `upi://pay?pa=${vpa}&pn=${payeeName}&am=${cust.outstandingDebt.toFixed(2)}&cu=INR&tn=${note}`;

      const reminderText = `*Khata Payment Reminder - ${dealerProfile?.businessName || 'Wholesale'}*\n\nNamaste *${cust.name} ji* (${cust.businessName}),\n\nThis is a statement of your wholesale Khata balance.\n\n• *Total Outstanding Due:* ₹${cust.outstandingDebt.toLocaleString('en-IN')}\n• *Credit Limit:* ₹${cust.creditLimit.toLocaleString('en-IN')}\n\nPlease settle the pending balance to keep dispatches uninterrupted.\n\n*1-Tap UPI Payment:*\n${upiDeepLink}\n\nThank you,\n*${dealerProfile?.businessName || ''}*`;

      await prisma.customer.update({ where: { id: cust.id }, data: { lastReminderSent: nowIso } });

      batch.push({
        customerId: cust.id,
        businessName: cust.businessName,
        phone: cust.phone,
        outstandingDebt: cust.outstandingDebt,
        upiDeepLink,
        status: 'PREPARED', // nothing is sent automatically - the dealer sends via WhatsApp
        reminderText
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: nowIso,
      remindersProcessed: batch.length,
      totalMarketDebtNotified: batch.reduce((s, r) => s + r.outstandingDebt, 0),
      batch
    });
  } catch (err) {
    return handleError(err, 'reminders:batch', 'Failed to process batch reminders');
  }
}
