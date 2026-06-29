/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Habit } from "../types";
import { getHabitCoachingAI } from "../lib/gemini";

interface HabitTrackerProps {
  habits: Habit[];
  onAddHabit: (habit: Habit) => void;
  onUpdateHabit: (habit: Habit) => void;
}

export default function HabitTracker({ habits, onAddHabit, onUpdateHabit }: HabitTrackerProps) {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<"study" | "exercise" | "reading" | "sleep" | "general">("study");

  const [coachingMap, setCoachingMap] = useState<{ [habitId: string]: string }>({});
  const [isCoachingId, setIsCoachingId] = useState<string | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newH: Habit = {
      habitId: `h-${Date.now()}`,
      userId: "user-1",
      title,
      streak: 0,
      completionRate: 0,
      history: {},
      category
    };

    onAddHabit(newH);
    setTitle("");
    setShowAddForm(false);
  };

  const handleCheckIn = (habit: Habit) => {
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const updatedHistory = { ...habit.history };
    const checked = !updatedHistory[todayStr];
    
    updatedHistory[todayStr] = checked;

    // Recalculate streak and completionRate
    const streak = checked ? habit.streak + 1 : Math.max(0, habit.streak - 1);
    
    const dates = Object.keys(updatedHistory);
    const completedCount = dates.filter((d) => updatedHistory[d]).length;
    const completionRate = dates.length > 0 ? Math.round((completedCount / dates.length) * 100) : checked ? 100 : 0;

    onUpdateHabit({
      ...habit,
      streak,
      completionRate,
      history: updatedHistory
    });
  };

  const handleGetCoaching = async (habit: Habit) => {
    setIsCoachingId(habit.habitId);
    try {
      const advice = await getHabitCoachingAI(habit);
      setCoachingMap((prev) => ({
        ...prev,
        [habit.habitId]: advice
      }));
    } catch (e) {
      console.error("Coaching failed:", e);
    } finally {
      setIsCoachingId(null);
    }
  };

  // Pre-generate heat map days for grid (last 14 days)
  const heatmapDays = Array.from({ length: 14 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - idx);
    return d.toISOString().split("T")[0];
  }).reverse();

  return (
    <div className="space-y-6 animate-pulse-soft">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-black text-white tracking-tighter uppercase">
            Atomic Streak Tracker
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Construct consistency loops, review habit heatmaps, and request tactical coaching.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/20 active:scale-95 transition-all flex items-center gap-1.5 uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-sm">alarm_on</span>
          Add Habit
        </button>
      </div>

      {/* Habit Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="glass-panel p-6 rounded-2xl border-neutral-800 space-y-4">
          <h3 className="font-display text-sm font-black text-white uppercase tracking-widest">
            Register New Daily Habit
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-500 mb-1.5 font-bold">
                Habit Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g. Meditate for 10 mins"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-500 mb-1.5 font-bold">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="study" className="bg-neutral-900 text-white">Study & Research</option>
                <option value="exercise" className="bg-neutral-900 text-white">Exercise & Fitness</option>
                <option value="reading" className="bg-neutral-900 text-white">Reading & Deep Work</option>
                <option value="sleep" className="bg-neutral-900 text-white">Sleep & Restore</option>
                <option value="general" className="bg-neutral-900 text-white">General Routine</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold shadow-md hover:bg-orange-500 active:scale-95 transition-all uppercase tracking-wider"
            >
              Save Habit
            </button>
          </div>
        </form>
      )}

      {/* Habit List */}
      <div className="space-y-4">
        {habits.map((habit) => {
          const todayStr = new Date().toISOString().split("T")[0];
          const isDoneToday = !!habit.history[todayStr];
          const advice = coachingMap[habit.habitId] || "Atomic coaching cue pending. Click below to load.";

          return (
            <div key={habit.habitId} className="glass-panel p-6 rounded-3xl border-neutral-800 space-y-4">
              <div className="flex justify-between items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] uppercase font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                      {habit.category}
                    </span>
                    <span className="font-mono text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                      🔥 {habit.streak} DAY STREAK
                    </span>
                  </div>
                  <h3 className="font-display text-sm font-bold text-white tracking-tight">
                    {habit.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleCheckIn(habit)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95 uppercase tracking-wider ${
                    isDoneToday
                      ? "bg-orange-600 text-white shadow-lg"
                      : "bg-neutral-950 border border-neutral-800 text-white hover:bg-neutral-900"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {isDoneToday ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  {isDoneToday ? "Check-In Done ✓" : "Log Check-In"}
                </button>
              </div>

              {/* Heatmap Grid */}
              <div className="space-y-1.5">
                <h4 className="font-mono text-[9px] text-neutral-500 uppercase tracking-wider font-bold">
                  Consistency Track Grid (Last 14 Days)
                </h4>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {heatmapDays.map((dayStr) => {
                    const checked = !!habit.history[dayStr];
                    const labelDay = new Date(dayStr).getDate();
                    return (
                      <div
                        key={dayStr}
                        className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[8px] font-bold border transition-all ${
                          checked
                            ? "bg-orange-600 text-white border-orange-500 shadow-[0_0_8px_rgba(234,88,12,0.4)]"
                            : "bg-neutral-950 border-neutral-800 text-neutral-500"
                        }`}
                        title={dayStr}
                      >
                        {labelDay}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Habit Coaching section */}
              <div className="pt-3 border-t border-neutral-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-bold">
                    Behavior Design Advice
                  </span>
                  <button
                    onClick={() => handleGetCoaching(habit)}
                    disabled={isCoachingId === habit.habitId}
                    className="font-mono text-[9px] uppercase text-orange-500 hover:underline flex items-center gap-1 font-bold"
                  >
                    {isCoachingId === habit.habitId ? (
                      "Formulating..."
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                        Ask Gemini Coach
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  {advice}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
