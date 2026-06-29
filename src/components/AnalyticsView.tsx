/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ProductivityAnalytics } from "../types";

interface AnalyticsViewProps {
  analytics: ProductivityAnalytics;
}

export default function AnalyticsView({ analytics }: AnalyticsViewProps) {
  // Find maximum trend score to scale charts
  const maxScore = Math.max(...analytics.weeklyTrends.map((t) => t.score));

  return (
    <div className="space-y-6 animate-pulse-soft">
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-black text-white tracking-tighter uppercase">
          Productivity Cockpit
        </h2>
        <p className="text-xs text-neutral-400 leading-relaxed">
          SaaS-grade trajectory metrics, weekly momentum trends, and algorithmic coaching briefs.
        </p>
      </div>

      {/* Primary KPI Blocks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Productivity Score", val: `${analytics.productivityScore}%`, icon: "speed", color: "text-orange-500" },
          { label: "Task Completion", val: `${analytics.completionRate}%`, icon: "playlist_add_check", color: "text-orange-400" },
          { label: "Deep Focus Hours", val: `${analytics.focusTime}h`, icon: "schedule", color: "text-amber-500" },
          { label: "Missed Deadlines", val: `${analytics.missedDeadlines}`, icon: "running_with_errors", color: "text-red-500" }
        ].map((item, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-3xl border-neutral-800 flex flex-col justify-between h-32">
            <div className="flex justify-between items-center text-neutral-500">
              <span className="font-mono text-[9px] uppercase tracking-wider font-bold">{item.label}</span>
              <span className={`material-symbols-outlined text-lg ${item.color}`}>{item.icon}</span>
            </div>
            <p className="font-display text-2xl font-black text-white tracking-tight">{item.val}</p>
          </div>
        ))}
      </div>

      {/* Weekly Momentum Chart */}
      <div className="glass-panel p-6 rounded-3xl border-neutral-800 space-y-4">
        <h3 className="font-display text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-orange-500">bar_chart</span>
          Weekly Momentum Sprints
        </h3>

        {/* Custom Responsive SVG Chart */}
        <div className="w-full h-48 flex items-end justify-between gap-2 pt-6 px-4">
          {analytics.weeklyTrends.map((trend, idx) => {
            const heightPercentage = Math.round((trend.score / 100) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full bg-neutral-950 border border-neutral-800/40 rounded-t-lg h-28 flex flex-col justify-end relative overflow-hidden">
                  <div
                    className="w-full bg-orange-600 rounded-t-lg group-hover:opacity-95 transition-all duration-300"
                    style={{ height: `${heightPercentage}%` }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded text-[8px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      Score: {trend.score}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-neutral-500 font-bold">
                  {trend.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Algorithmic Coaching Briefs list */}
      <div className="glass-panel p-6 rounded-3xl border-neutral-800 space-y-4">
        <h3 className="font-display text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
          <span className="material-symbols-outlined text-orange-500 text-sm">auto_awesome</span>
          Gemini Behavioral Coaching
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {analytics.coachingInsights.map((insight, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 leading-relaxed flex items-start gap-3"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0 animate-pulse"></span>
              <p>{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
