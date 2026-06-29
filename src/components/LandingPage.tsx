/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface LandingPageProps {
  onStartOnboarding: () => void;
}

export default function LandingPage({ onStartOnboarding }: LandingPageProps) {
  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center px-4 pt-20 pb-32">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-600/10 border border-orange-500/20 mb-8 animate-pulse">
        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
        <span className="font-mono text-xs uppercase tracking-widest text-orange-400 font-bold">
          Omni Mind v2.0 Engine Live
        </span>
      </div>

      {/* Hero Title */}
      <h1 className="font-display text-5xl sm:text-7xl font-black text-center tracking-tighter text-white max-w-4xl leading-none mb-6 uppercase">
        Never Miss Another{" "}
        <span className="text-orange-500 block sm:inline">
          Deadline.
        </span>
      </h1>

      {/* Description */}
      <p className="font-sans text-base sm:text-lg text-neutral-400 text-center max-w-2xl leading-relaxed mb-12">
        An elite AI-powered productivity companion that shifts from passive reminders to autonomous action planning. It anticipates bottlenecks, structures schedules, and coaches you to peak velocity.
      </p>

      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center mb-16">
        <button
          onClick={onStartOnboarding}
          className="px-8 py-4 rounded-xl bg-orange-600 text-white font-black text-base uppercase tracking-wider shadow-[0_0_30px_rgba(234,88,12,0.3)] hover:bg-orange-500 hover:shadow-[0_0_40px_rgba(234,88,12,0.55)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
        >
          Initialize AI Companion
        </button>
        <button
          onClick={onStartOnboarding}
          className="px-8 py-4 rounded-xl bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-orange-500">play_circle</span>
          Watch Flight Demo
        </button>
      </div>

      {/* Feature Showcase Grid (Bento) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        <div className="glass-card p-8 rounded-3xl border-neutral-800 group hover:border-orange-500/20 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-orange-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-orange-500 text-2xl">bolt</span>
          </div>
          <h3 className="font-display text-lg font-black text-white mb-2 uppercase tracking-tight">Priority Scoring</h3>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Neural scoring agents weigh deadlines, effort, and current focus density to auto-rank tasks from 1 to 100.
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl border-neutral-800 group hover:border-orange-500/20 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-orange-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-orange-500 text-2xl">calendar_month</span>
          </div>
          <h3 className="font-display text-lg font-black text-white mb-2 uppercase tracking-tight">Daily Schedule Sprints</h3>
          <p className="text-sm text-neutral-400 leading-relaxed">
            AI planner breaks massive deliverables down into targeted time slots, scheduling around your external calendar.
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl border-neutral-800 group hover:border-orange-500/20 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-orange-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-orange-500 text-2xl">insights</span>
          </div>
          <h3 className="font-display text-lg font-black text-white mb-2 uppercase tracking-tight">Productivity Analytics</h3>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Spot procrastination clusters, review streak behaviors, and digest atomic coaching briefs from Gemini reasoning.
          </p>
        </div>
      </div>

      {/* Trust banner */}
      <div className="mt-20 flex justify-around items-center w-full max-w-3xl glass-card py-6 px-12 rounded-3xl text-center">
        <div>
          <p className="text-3xl font-black text-orange-500 tracking-tighter">99.2%</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mt-1">On-Time Rate</p>
        </div>
        <div className="w-[1px] h-12 bg-neutral-800"></div>
        <div>
          <p className="text-3xl font-black text-white tracking-tighter">2.5 hours</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mt-1">Average Time Saved / Day</p>
        </div>
        <div className="w-[1px] h-12 bg-neutral-800"></div>
        <div>
          <p className="text-3xl font-black text-emerald-500 tracking-tighter">24/7</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mt-1">Active Coaching</p>
        </div>
      </div>
    </div>
  );
}
