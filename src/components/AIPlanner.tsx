/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Task, CalendarEvent } from "../types";
import { optimizeScheduleWithAI } from "../lib/gemini";

interface AIPlannerProps {
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  onAddCalendarEvent: (event: CalendarEvent) => void;
}

export default function AIPlanner({ tasks, calendarEvents }: AIPlannerProps) {
  const [availabilityHours, setAvailabilityHours] = useState<number>(8);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [schedule, setSchedule] = useState<any[]>([
    {
      title: "Deep Work: Quarterly Data Infrastructure Audit",
      startTime: "09:30",
      endTime: "11:30",
      notes: "High risk block. Resolve S3 dead partitions and database indexing immediately."
    },
    {
      title: "Calendar Meeting: Investor Q&A Session",
      startTime: "11:30",
      endTime: "12:30",
      notes: "Pre-existing sync event. Avoid overlapping tasks."
    },
    {
      title: "Strategic Buffer & Inbox Zero",
      startTime: "13:30",
      endTime: "14:15",
      notes: "Decompress, reply to blocked team channels."
    },
    {
      title: "Deep Work: Emergency Patch v2.4 API Leak",
      startTime: "14:15",
      endTime: "15:30",
      notes: "Re-encrypt oauth callback fields. Security audit mandatory."
    }
  ]);
  const [coachingAdvice, setCoachingAdvice] = useState<string>(
    "Your trajectory today features a 4-hour critical bottleneck. Prioritize S3 audits first to liberate Dave and Sarah before their retro block."
  );

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const activeTasks = tasks.filter((t) => t.status !== "completed");
      const result = await optimizeScheduleWithAI(activeTasks, calendarEvents, availabilityHours);
      if (result.schedule && result.schedule.length > 0) {
        setSchedule(result.schedule);
      }
      if (result.coachingAdvice) {
        setCoachingAdvice(result.coachingAdvice);
      }
    } catch (e) {
      console.error("Schedule optimization failed:", e);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-black text-white tracking-tighter uppercase">
          AI Daily Scheduler
        </h2>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Solve conflicts and auto-block tasks around calendar meetings dynamically.
        </p>
      </div>

      {/* Control Panel Bento Card */}
      <div className="glass-panel p-6 rounded-3xl border-neutral-800 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-2">
          <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-500 font-bold">
            Daily Focus Threshold (Hours)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="4"
              max="12"
              value={availabilityHours}
              onChange={(e) => setAvailabilityHours(Number(e.target.value))}
              className="flex-1 accent-orange-600 h-1 bg-neutral-950 border border-neutral-800 rounded-lg appearance-none cursor-pointer"
            />
            <span className="font-display font-black text-white text-base shrink-0">{availabilityHours} Hours</span>
          </div>
          <p className="text-[10px] text-neutral-500 font-semibold leading-relaxed">
            Configure your focus bounds. Gemini respects buffers to prevent fatigue.
          </p>
        </div>

        <div className="md:col-span-4">
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="w-full py-3.5 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-600/20 disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-orange-500 active:scale-95 transition-all uppercase tracking-wider"
          >
            {isOptimizing ? (
              <>
                <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin"></div>
                Resolving Conflicts...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                Optimize with Gemini
              </>
            )}
          </button>
        </div>
      </div>

      {/* Coaching Advice Panel */}
      {coachingAdvice && (
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 leading-relaxed flex gap-3">
          <span className="material-symbols-outlined text-orange-500 text-base animate-pulse shrink-0">
            auto_awesome
          </span>
          <div>
            <span className="font-bold text-orange-500 mr-1 uppercase tracking-wide">Coaching Brief:</span>
            {coachingAdvice}
          </div>
        </div>
      )}

      {/* Visual Timeline Schedule */}
      <div className="glass-panel rounded-3xl border-neutral-800 p-6 space-y-6">
        <h3 className="font-display text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-orange-500">schedule</span>
          Day Schedule Sprints
        </h3>

        <div className="relative border-l border-neutral-800 pl-6 ml-3 space-y-6">
          {schedule.map((item, index) => (
            <div key={index} className="relative group">
              {/* Pulse timeline node indicator */}
              <span className={`absolute -left-[32px] top-1 w-3.5 h-3.5 rounded-full border-2 border-black ${
                item.title.toLowerCase().includes("meeting") 
                  ? "bg-amber-500" 
                  : item.title.toLowerCase().includes("buffer")
                  ? "bg-amber-600"
                  : "bg-orange-600 animate-pulse"
              }`}></span>

              <div className="space-y-1.5">
                <span className="font-mono text-[10px] text-neutral-500 tracking-wider font-bold">
                  {item.startTime} — {item.endTime}
                </span>
                <h4 className="text-sm font-semibold text-white group-hover:text-orange-500 transition-colors">
                  {item.title}
                </h4>
                {item.notes && (
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {item.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
