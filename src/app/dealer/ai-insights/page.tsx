'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import RevenueComparisonChart from '@/components/RevenueComparisonChart';
import RegionalAdviceCard from '@/components/RegionalAdviceCard';
import {
  Sparkles,
  TrendingUp,
  MapPin,
  PackageCheck,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function AiInsightsPage() {
  const {
    monthlyStats,
    regionalData,
    aiAnalysisText,
    isGeneratingAi,
    generateAiInsights
  } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold mb-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            AI Business Intelligence Suite
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Monthly Performance & Regional Advice
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1">
            Automated trend analysis comparing current month revenue with the last 3 months, state demand trends, and restock alerts.
          </p>
        </div>

        <button
          onClick={generateAiInsights}
          disabled={isGeneratingAi}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isGeneratingAi ? 'animate-spin' : ''}`} />
          {isGeneratingAi ? 'Analyzing Data...' : 'Run Gemini AI Analysis'}
        </button>
      </div>

      {/* 3-Month Comparison Chart */}
      <RevenueComparisonChart data={monthlyStats} />

      {/* Narrative AI Analysis Output Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Growth & Inventory Report
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Actionable business intelligence synthesized from wholesale order flows.
              </p>
            </div>
          </div>
        </div>

        {aiAnalysisText ? (
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
            <div className="whitespace-pre-line prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
              {aiAnalysisText}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center">
            <Sparkles className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Report Generated Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Tap the <b>&quot;Run Gemini AI Analysis&quot;</b> button above to compute your 3-month sales comparison, recovery ratios, and regional stock allocations.
            </p>
            <button
              onClick={generateAiInsights}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md"
            >
              Generate AI Summary Now
            </button>
          </div>
        )}
      </div>

      {/* Regional State-Wise Breakdown */}
      <RegionalAdviceCard regions={regionalData} />
    </div>
  );
}
