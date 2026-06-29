/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Goal, Milestone } from "../types";
import { forecastGoalAI } from "../lib/gemini";

interface GoalTrackerProps {
  goals: Goal[];
  milestones: Milestone[];
  onAddGoal: (goal: Goal) => void;
  onUpdateGoal: (goal: Goal) => void;
  onAddMilestone: (milestone: Milestone) => void;
  onUpdateMilestone: (milestone: Milestone) => void;
}

export default function GoalTracker({
  goals,
  milestones,
  onAddGoal,
  onUpdateGoal,
  onAddMilestone,
  onUpdateMilestone
}: GoalTrackerProps) {
  const [showAddGoalForm, setShowAddGoalForm] = useState<boolean>(false);
  const [newGoalTitle, setNewGoalTitle] = useState<string>("");
  const [newGoalCat, setNewGoalCat] = useState<"Academic" | "Career" | "Business" | "Personal">("Business");
  const [newGoalDate, setNewGoalDate] = useState<string>("");

  const [newMilestoneTitle, setNewMilestoneTitle] = useState<string>("");
  const [activeGoalMilestoneId, setActiveGoalMilestoneId] = useState<string | null>(null);

  // AI Forecasting state
  const [isForecastingGoalId, setIsForecastingGoalId] = useState<string | null>(null);
  const [forecastResults, setForecastResults] = useState<{ [goalId: string]: { probability: number; rationale: string } }>({});

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle || !newGoalDate) return;

    const gId = `g-${Date.now()}`;
    const newG: Goal = {
      goalId: gId,
      userId: "user-1",
      title: newGoalTitle,
      progress: 0,
      targetDate: newGoalDate,
      category: newGoalCat,
      successProbability: 50
    };

    onAddGoal(newG);
    setNewGoalTitle("");
    setNewGoalDate("");
    setShowAddGoalForm(false);
  };

  const handleAddMilestoneSubmit = (goalId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle) return;

    const newM: Milestone = {
      milestoneId: `m-${Date.now()}`,
      goalId,
      title: newMilestoneTitle,
      status: "pending"
    };

    onAddMilestone(newM);
    setNewMilestoneTitle("");
    recalculateGoalProgress(goalId);
  };

  const toggleMilestone = (mil: Milestone) => {
    const updatedStatus = mil.status === "completed" ? "pending" : "completed";
    onUpdateMilestone({ ...mil, status: updatedStatus });
    
    // Defer updating progress to recalculation helper
    setTimeout(() => {
      recalculateGoalProgress(mil.goalId);
    }, 50);
  };

  const recalculateGoalProgress = (goalId: string) => {
    const goalMils = milestones.filter((m) => m.goalId === goalId);
    if (goalMils.length === 0) return;

    const completed = goalMils.filter((m) => m.status === "completed").length;
    const progress = Math.round((completed / goalMils.length) * 100);

    const targetGoal = goals.find((g) => g.goalId === goalId);
    if (targetGoal) {
      onUpdateGoal({ ...targetGoal, progress });
    }
  };

  const handleForecastSuccess = async (goal: Goal) => {
    setIsForecastingGoalId(goal.goalId);
    try {
      const goalMils = milestones.filter((m) => m.goalId === goal.goalId);
      const forecast = await forecastGoalAI(goal, goalMils);
      setForecastResults((prev) => ({
        ...prev,
        [goal.goalId]: forecast
      }));
      onUpdateGoal({ ...goal, successProbability: forecast.probability });
    } catch (e) {
      console.error("Forecast failed:", e);
    } finally {
      setIsForecastingGoalId(null);
    }
  };

  return (
    <div className="space-y-6 animate-pulse-soft">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-black text-white tracking-tighter uppercase">
            Goal & Milestone Tracker
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Anchor your trajectory, check off major milestones, and simulate execution predictability.
          </p>
        </div>
        <button
          onClick={() => setShowAddGoalForm(!showAddGoalForm)}
          className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/20 active:scale-95 transition-all flex items-center gap-1.5 uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-sm">add_task</span>
          Create Goal
        </button>
      </div>

      {/* Goal Add Form */}
      {showAddGoalForm && (
        <div className="glass-panel p-6 rounded-2xl border-neutral-800 space-y-4">
          <h3 className="font-display text-sm font-black text-white uppercase tracking-widest">
            Define New Focus Goal
          </h3>
          <form onSubmit={handleAddGoalSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-500 mb-1.5 font-bold">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. Publish core research paper"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-500 mb-1.5 font-bold">
                  Target Date
                </label>
                <input
                  type="date"
                  required
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-500 mb-1.5 font-bold">
                Category
              </label>
              <div className="flex gap-2">
                {["Academic", "Career", "Business", "Personal"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewGoalCat(cat as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      newGoalCat === cat
                        ? "bg-orange-600 text-white shadow-lg"
                        : "bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddGoalForm(false)}
                className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold shadow-md hover:bg-orange-500 active:scale-95 transition-all uppercase tracking-wider"
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals grid and details */}
      <div className="space-y-4">
        {goals.map((g) => {
          const goalMils = milestones.filter((m) => m.goalId === g.goalId);
          const forecast = forecastResults[g.goalId] || {
            probability: g.successProbability || 50,
            rationale: "Default heuristic rating. Run forecast tool to refresh."
          };

          return (
            <div key={g.goalId} className="glass-panel p-6 rounded-3xl border-neutral-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] uppercase font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                      {g.category}
                    </span>
                    <span className="font-mono text-[9px] text-neutral-500 font-semibold">
                      DUE: {new Date(g.targetDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold text-white tracking-tight">
                    {g.title}
                  </h3>
                </div>

                {/* AI Forecast button */}
                <button
                  onClick={() => handleForecastSuccess(g)}
                  disabled={isForecastingGoalId === g.goalId}
                  className="shrink-0 px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/25 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 font-bold"
                >
                  {isForecastingGoalId === g.goalId ? (
                    <>
                      <div className="w-3 h-3 border border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                      Forecasting...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">auto_awesome</span>
                      AI Forecast (Prob: {forecast.probability}%)
                    </>
                  )}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Overall Milestone Progress</span>
                  <span className="font-bold text-orange-400">{g.progress}%</span>
                </div>
                <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800/50">
                  <div
                    className="h-full bg-orange-600 transition-all duration-500 animate-pulse-soft"
                    style={{ width: `${g.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Forecast rational brief display */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 leading-relaxed">
                <span className="font-bold text-orange-400 mr-1 flex items-center gap-1 mb-1 font-mono uppercase tracking-widest text-[9px]">
                  <span className="material-symbols-outlined text-xs">analytics</span>
                  Gemini Forecast Insights:
                </span>
                {forecast.rationale}
              </div>

              {/* Milestones expand collapse */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider font-bold">
                    Target Milestones ({goalMils.length})
                  </h4>
                  <button
                    onClick={() => setActiveGoalMilestoneId(activeGoalMilestoneId === g.goalId ? null : g.goalId)}
                    className="font-mono text-[9px] uppercase text-orange-500 hover:underline font-bold"
                  >
                    {activeGoalMilestoneId === g.goalId ? "Close Panel" : "Manage Milestones"}
                  </button>
                </div>

                {activeGoalMilestoneId === g.goalId && (
                  <div className="space-y-3 pt-1 border-t border-neutral-800 animate-pulse-soft">
                    {goalMils.map((m) => (
                      <label
                        key={m.milestoneId}
                        className="flex items-center justify-between p-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800/50 rounded-xl cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={m.status === "completed"}
                            onChange={() => toggleMilestone(m)}
                            className="rounded border-neutral-800 bg-neutral-900 text-orange-600 focus:ring-orange-500"
                          />
                          <span className={`text-xs text-white ${m.status === "completed" && "line-through opacity-50"}`}>
                            {m.title}
                          </span>
                        </div>
                        <span className={`font-mono text-[9px] uppercase font-bold ${
                          m.status === "completed" ? "text-emerald-400" : "text-amber-400"
                        }`}>
                          {m.status}
                        </span>
                      </label>
                    ))}

                    {/* Add Milestone Inline Form */}
                    <form
                      onSubmit={(e) => handleAddMilestoneSubmit(g.goalId, e)}
                      className="flex items-center gap-2 pt-2"
                    >
                      <input
                        type="text"
                        required
                        value={newMilestoneTitle}
                        onChange={(e) => setNewMilestoneTitle(e.target.value)}
                        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Add secondary milestone..."
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shrink-0 uppercase tracking-wider"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
