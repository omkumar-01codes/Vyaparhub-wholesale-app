'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { MonthlyStats } from '@/lib/types';
import { TrendingUp, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function RevenueComparisonChart({ data }: { data: MonthlyStats[] }) {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const chartData = data.map((d) => ({
    name: d.month,
    sales: d.salesRevenue,
    recovered: d.debtRecovered,
    newDebt: d.newDebtGiven,
    orders: d.orderCount
  }));

  const currentMonth = data[data.length - 1];
  const prevMonth = data[data.length - 2];
  const momGrowth = (
    ((currentMonth.salesRevenue - prevMonth.salesRevenue) / prevMonth.salesRevenue) *
    100
  ).toFixed(1);

  const recoveryRate = (
    (currentMonth.debtRecovered / currentMonth.salesRevenue) *
    100
  ).toFixed(1);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors">
      {/* Header with KPI cards */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Revenue & Debt Comparison (Last 3 Months vs Current)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comparing monthly wholesale sales, debt recovery efficiency, and active order volumes.
          </p>
        </div>

        {/* Quick Growth Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 font-bold" />
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">MoM Sales Growth</div>
              <div className="text-sm font-extrabold text-emerald-800 dark:text-emerald-200">+{momGrowth}%</div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300">Debt Recovery Rate</div>
              <div className="text-sm font-extrabold text-blue-900 dark:text-blue-200">{recoveryRate}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 10, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
            <XAxis
              dataKey="name"
              stroke={isDark ? '#94a3b8' : '#64748b'}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: isDark ? '#475569' : '#cbd5e1' }}
            />
            <YAxis
              stroke={isDark ? '#94a3b8' : '#64748b'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (name === 'orders') return [`${value} Orders`, 'Order Count'];
                return [`₹${Number(value).toLocaleString('en-IN')}`, name];
              }}
              contentStyle={{
                backgroundColor: isDark ? '#020617' : '#0f172a',
                borderRadius: '12px',
                border: isDark ? '1px solid #1e293b' : 'none',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: isDark ? '#cbd5e1' : '#475569' }}
              formatter={(val) => {
                if (val === 'sales') return 'Total Sales Revenue (₹)';
                if (val === 'recovered') return 'Debt Recovered / Paid (₹)';
                if (val === 'newDebt') return 'New Credit / Udhaar (₹)';
                return val;
              }}
            />
            <Bar
              dataKey="sales"
              name="sales"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              barSize={28}
            />
            <Bar
              dataKey="recovered"
              name="recovered"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              barSize={28}
            />
            <Bar
              dataKey="newDebt"
              name="newDebt"
              fill="#f59e0b"
              radius={[6, 6, 0, 0]}
              barSize={28}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table below chart */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
        {data.map((m, idx) => (
          <div
            key={m.month}
            className={`p-3 rounded-2xl border transition-all ${
              idx === data.length - 1
                ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60'
            }`}
          >
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">{m.month}</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 font-mono">
              ₹{m.salesRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              ₹{m.debtRecovered.toLocaleString('en-IN')} Rec.
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
              {m.orderCount} Orders
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
