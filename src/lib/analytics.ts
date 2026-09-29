import type { Order, LedgerEntry, Customer, MonthlyStats, RegionalInsight } from './types';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Real monthly rollup from actual orders + ledger, most recent 4 calendar months, oldest first. */
export function computeMonthlyStats(orders: Order[], ledger: LedgerEntry[]): MonthlyStats[] {
  const now = new Date();
  const months: { key: string; month: string; year: number; start: Date; end: Date }[] = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = d;
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: MONTH_NAMES[d.getMonth()], year: d.getFullYear(), start, end });
  }

  return months.map(({ month, year, start, end }) => {
    const monthOrders = orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= start.getTime() && t < end.getTime();
    });
    // "Sales" = confirmed revenue: paid, or on credit (a Khata order still books the sale).
    const salesRevenue = monthOrders
      .filter((o) => o.orderStatus !== 'CANCELLED' && o.paymentStatus !== 'REJECTED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const monthLedger = ledger.filter((e) => {
      const t = new Date(e.date).getTime();
      return t >= start.getTime() && t < end.getTime();
    });
    const debtRecovered = monthLedger.filter((e) => e.type === 'CREDIT_PAYMENT').reduce((s, e) => s + e.amount, 0);
    const newDebtGiven = monthLedger.filter((e) => e.type === 'DEBIT_ORDER').reduce((s, e) => s + e.amount, 0);

    const activeRetailers = new Set(monthOrders.map((o) => o.customerId).filter(Boolean)).size;

    return {
      month,
      year,
      salesRevenue: Math.round(salesRevenue),
      debtRecovered: Math.round(debtRecovered),
      newDebtGiven: Math.round(newDebtGiven),
      orderCount: monthOrders.length,
      activeRetailers
    };
  });
}

/** Real per-state rollup from actual orders. growthPercentage compares the two halves of order history. */
export function computeRegionalInsights(orders: Order[], customers: Customer[]): RegionalInsight[] {
  const validOrders = orders.filter((o) => o.orderStatus !== 'CANCELLED');
  const states = new Set<string>();
  customers.forEach((c) => c.state && states.add(c.state));
  validOrders.forEach((o) => o.state && states.add(o.state));

  const sorted = [...validOrders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const midpoint = Math.floor(sorted.length / 2);
  const earlier = sorted.slice(0, midpoint);
  const later = sorted.slice(midpoint);

  const results: RegionalInsight[] = [];
  states.forEach((state) => {
    const stateOrders = validOrders.filter((o) => o.state === state);
    if (stateOrders.length === 0) return;

    const revenue = Math.round(stateOrders.reduce((s, o) => s + o.totalAmount, 0));
    const salesVolume = stateOrders.reduce((s, o) => s + o.items.reduce((qs, it) => qs + it.quantity, 0), 0);

    const productTotals = new Map<string, number>();
    stateOrders.forEach((o) => o.items.forEach((it) => productTotals.set(it.productName, (productTotals.get(it.productName) || 0) + it.quantity)));
    const topProduct = Array.from(productTotals.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No sales yet';

    const earlierRev = earlier.filter((o) => o.state === state).reduce((s, o) => s + o.totalAmount, 0);
    const laterRev = later.filter((o) => o.state === state).reduce((s, o) => s + o.totalAmount, 0);
    const growthPercentage = earlierRev > 0 ? Math.round(((laterRev - earlierRev) / earlierRev) * 1000) / 10 : 0;

    const demandTrend: RegionalInsight['demandTrend'] =
      stateOrders.length < 3 ? 'LOW' : growthPercentage > 15 ? 'GROWING' : growthPercentage > -5 ? 'STABLE' : 'LOW';

    const custDebt = customers.filter((c) => c.state === state).reduce((s, c) => s + c.outstandingDebt, 0);
    const recommendation =
      stateOrders.length < 3
        ? `Limited order history from ${state} so far — reach out to registered retailers here to build volume.`
        : demandTrend === 'GROWING'
        ? `${state} is growing (${growthPercentage > 0 ? '+' : ''}${growthPercentage}%). "${topProduct}" is the top seller — keep it well stocked.`
        : custDebt > revenue * 0.3
        ? `Outstanding Khata in ${state} (₹${Math.round(custDebt).toLocaleString('en-IN')}) is high relative to sales — prioritise collection here.`
        : `${state} demand is steady. "${topProduct}" leads sales.`;

    results.push({ region: state, salesVolume, revenue, topProduct, growthPercentage, demandTrend, recommendation });
  });

  return results.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Rule-based (not model-generated) summary built entirely from real numbers already
 * in the app. Labelled honestly as a computed summary, not a live LLM call.
 */
export function buildInsightsSummary(
  monthlyStats: MonthlyStats[],
  regionalData: RegionalInsight[],
  totalOutstanding: number,
  totalCreditIssued: number
): string {
  const cur = monthlyStats[monthlyStats.length - 1];
  const prev = monthlyStats[monthlyStats.length - 2];
  const label = `${cur.month} ${cur.year}`;

  if (cur.orderCount === 0 && monthlyStats.every((m) => m.orderCount === 0)) {
    return `### 📊 Business Summary (${label})\n\nNo orders have been placed yet, so there isn't enough data for a summary. Once orders start coming in, this report will show real revenue trends, regional performance, and collection advice.`;
  }

  const growthLine =
    prev && prev.salesRevenue > 0
      ? `${(((cur.salesRevenue - prev.salesRevenue) / prev.salesRevenue) * 100).toFixed(1)}% vs ${prev.month} (₹${prev.salesRevenue.toLocaleString('en-IN')})`
      : 'not enough prior-month data for a comparison yet';

  const recoveryRate = totalCreditIssued > 0 ? ((monthlyStats.reduce((s, m) => s + m.debtRecovered, 0) / totalCreditIssued) * 100).toFixed(1) : '0.0';

  const topRegions = regionalData.slice(0, 3);
  const growingRegions = regionalData.filter((r) => r.demandTrend === 'GROWING').slice(0, 2);

  const lines: string[] = [];
  lines.push(`### 📊 Business Summary (${label})`);
  lines.push('');
  lines.push('#### Revenue');
  lines.push(`- This month's revenue: ₹${cur.salesRevenue.toLocaleString('en-IN')} across ${cur.orderCount} order(s), ${cur.activeRetailers} active retailer(s).`);
  lines.push(`- Change: ${growthLine}.`);
  lines.push('');
  lines.push('#### Khata / Debt');
  lines.push(`- Outstanding market debt right now: ₹${Math.round(totalOutstanding).toLocaleString('en-IN')}.`);
  lines.push(`- Recovery rate over the last ${monthlyStats.length} months: ${recoveryRate}% of credit issued.`);
  lines.push('');
  if (topRegions.length > 0) {
    lines.push('#### Top states by revenue');
    topRegions.forEach((r) => lines.push(`- **${r.region}**: ₹${r.revenue.toLocaleString('en-IN')}, top product "${r.topProduct}".`));
    lines.push('');
  }
  if (growingRegions.length > 0) {
    lines.push('#### Growing');
    growingRegions.forEach((r) => lines.push(`- ${r.recommendation}`));
  }

  return lines.join('\n');
}
