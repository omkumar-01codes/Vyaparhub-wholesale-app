'use client';

import React from 'react';
import { RegionalInsight } from '@/lib/types';
import { MapPin, TrendingUp, Sparkles, PackageCheck, AlertCircle } from 'lucide-react';

export default function RegionalAdviceCard({ regions }: { regions: RegionalInsight[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              State & Regional Performance Advice
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Territory-wise order distribution and AI-recommended inventory allocation.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regions.map((region) => {
          const isHigh = region.demandTrend === 'HIGH';
          const isGrowing = region.demandTrend === 'GROWING';

          return (
            <div
              key={region.region}
              className={`p-4 rounded-2xl border transition-all ${
                isHigh
                  ? 'bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/40 border-blue-200 dark:border-blue-800'
                  : isGrowing
                  ? 'bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/40 border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
              }`}
            >
              {/* Region Title & Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    {region.region}
                  </h4>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Top Demand: <b className="text-slate-800 dark:text-slate-200">{region.topProduct}</b>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                    isHigh
                      ? 'bg-blue-600 text-white'
                      : isGrowing
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {region.demandTrend} DEMAND
                </span>
              </div>

              {/* Numbers grid */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                <div>
                  <div className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold">Revenue</div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                    ₹{region.revenue.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold">Growth Rate</div>
                  <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{region.growthPercentage}%
                  </div>
                </div>
              </div>

              {/* AI Recommendation Alert */}
              <div className="mt-3 p-2.5 bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-700 rounded-xl flex items-start gap-2 shadow-xs">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-bold text-indigo-900 dark:text-indigo-300">AI Advice: </span>
                  {region.recommendation}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
