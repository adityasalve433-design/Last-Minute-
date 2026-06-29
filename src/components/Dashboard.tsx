/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Task, Goal, Habit, AIRecommendation, UserProfile } from "../types";

interface DashboardProps {
  user: UserProfile;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  recommendations: AIRecommendation[];
  onNavigate: (tab: string) => void;
  onUpdateTask: (task: Task) => void;
}

export default function Dashboard({
  user,
  tasks,
  goals,
  habits,
  recommendations,
  onNavigate,
  onUpdateTask
}: DashboardProps) {
  const [blitzTask, setBlitzTask] = useState<Task | null>(null);
  const [countdown, setCountdown] = useState<string>("");

  const activeTasks = tasks.filter((t) => t.status !== "completed");
  const criticalTasks = activeTasks.filter((t) => t.priorityScore >= 90);
  
  // Find the single highest priority active task
  const mostCriticalTask = activeTasks.reduce<Task | null>((max, curr) => {
    if (!max) return curr;
    return curr.priorityScore > max.priorityScore ? curr : max;
  }, null);

  useEffect(() => {
    if (mostCriticalTask) {
      const interval = setInterval(() => {
        const diff = new Date(mostCriticalTask.deadline).getTime() - Date.now();
        if (diff <= 0) {
          setCountdown("Overdue!");
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdown(`${hours}h ${mins}m ${secs}s`);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCountdown("");
    }
  }, [mostCriticalTask]);

  const handleBlitzComplete = () => {
    if (mostCriticalTask) {
      const updated = { ...mostCriticalTask, status: "completed" as const };
      onUpdateTask(updated);
    }
  };

  // Safe calculation for progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  // Render SVG Ring for Priority/Efficiency Score
  const strokeDasharray = 2 * Math.PI * 45; // r=45 -> 282.7
  const strokeDashoffset = strokeDasharray - (strokeDasharray * taskCompletionRate) / 100;

  return (
    <div className="space-y-8 animate-pulse-soft">
      {/* Urgent Advisory Alert Banner */}
      {criticalTasks.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl glow-error">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0"></span>
          <span className="font-mono text-xs uppercase tracking-widest text-red-400 font-semibold shrink-0">
            Urgent Advisory
          </span>
          <div className="h-4 w-[1px] bg-white/10 shrink-0"></div>
          <p className="text-xs text-on-surface-variant truncate">
            You have {criticalTasks.length} high-risk deadlines today. AI predicts a bottleneck at noon.
          </p>
          <button
            onClick={() => onNavigate("planner")}
            className="ml-auto text-xs font-semibold text-red-400 hover:underline shrink-0"
          >
            Review Plan
          </button>
        </div>
      )}

      {/* Main Header Greeting */}
      <section className="space-y-2">
        <h1 className="font-display text-4xl sm:text-5xl font-black text-white tracking-tighter">
          Good morning, {user.name.split(" ")[0]}.
        </h1>
        <p className="text-sm text-neutral-400 leading-relaxed max-w-2xl">
          Your profile as an active <span className="text-orange-400 capitalize font-bold">{user.role}</span> is live. {user.aiProfileText && `Your active focus: "${goals[0]?.title || 'Standard Sprints'}".`}
        </p>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* SVG Efficiency Gauge */}
        <div className="md:col-span-5 glass-card rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <h3 className="font-mono text-xs text-neutral-500 uppercase tracking-widest mb-6">Task Completion</h3>
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                className="text-neutral-800"
                cx="80"
                cy="80"
                fill="transparent"
                r="45"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <circle
                className="text-orange-500 stroke-orange-500"
                cx="80"
                cy="80"
                fill="transparent"
                r="45"
                stroke="currentColor"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeWidth="6"
                strokeLinecap="round"
              ></circle>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-display text-5xl font-black text-orange-400 tracking-tighter">
                {taskCompletionRate}%
              </span>
              <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-wider">
                Completed
              </span>
            </div>
          </div>
          <p className="mt-6 font-sans text-xs text-neutral-400 text-center max-w-[200px]">
            Your momentum is <span className="text-orange-400 font-bold">12% higher</span> than last week. Keep it up!
          </p>
        </div>

        {/* Most Critical Active Task Card */}
        <div className="md:col-span-7 glass-card rounded-3xl p-6 border-orange-500/10 hover:border-orange-500/30 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          {mostCriticalTask ? (
            <>
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20 font-bold uppercase tracking-wider">
                    CRITICAL PRIORITY • {mostCriticalTask.priorityScore}
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tighter mt-3">
                    {mostCriticalTask.title}
                  </h2>
                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2 mt-1">
                    {mostCriticalTask.description}
                  </p>
                </div>
                <span className="material-symbols-outlined text-orange-500 text-3xl animate-pulse shrink-0">
                  priority_high
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {mostCriticalTask.tags?.map((t, idx) => (
                    <span key={idx} className="font-mono text-[9px] bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded text-neutral-400 font-semibold">
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4 pt-4 border-t border-neutral-800">
                  <div className="space-y-0.5">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                      DEADLINE TIME REMAINING
                    </p>
                    <p className="font-display text-lg sm:text-xl font-black text-orange-500 tracking-tighter">
                      {countdown || "Calculating..."}
                    </p>
                  </div>
                  <button
                    onClick={handleBlitzComplete}
                    className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold active:scale-95 shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all flex items-center justify-center gap-1 uppercase tracking-tighter"
                  >
                    <span className="material-symbols-outlined text-sm">done_all</span>
                    Complete Sprint
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <span className="material-symbols-outlined text-orange-500 text-4xl animate-bounce mb-3">
                check_circle
              </span>
              <h3 className="font-display text-xl font-bold text-white">All Clear!</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                Excellent focus. No critical high-risk deadlines remain on your queue. Use this space for strategic planning.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* AI Recommendations Stream Panel */}
      {recommendations.length > 0 && (
        <section className="space-y-4">
          <h3 className="font-display text-xs font-black text-neutral-400 uppercase tracking-widest">
            AI Companion Stream
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.slice(0, 2).map((rec) => (
              <div
                key={rec.recommendationId}
                className="glass-card p-5 rounded-2xl border-neutral-800 hover:border-orange-500/20 transition-all flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-600/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-orange-500 text-lg">auto_awesome</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-neutral-200 leading-relaxed">{rec.recommendationText}</p>
                  <button
                    onClick={() => onNavigate(rec.actionType === "schedule" ? "planner" : "tasks")}
                    className="font-mono text-[10px] uppercase text-orange-400 hover:underline font-bold"
                  >
                    Execute Command →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trajectory List View */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="font-display text-xs font-black text-neutral-400 uppercase tracking-widest">
            Trajectory Queue
          </h3>
          <button
            onClick={() => onNavigate("tasks")}
            className="font-mono text-xs text-orange-500 hover:underline font-bold"
          >
            Manage All →
          </button>
        </div>

        <div className="space-y-3">
          {activeTasks.slice(0, 3).map((task) => (
            <div
              key={task.taskId}
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:bg-neutral-800/10 hover:border-orange-500/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-950 flex items-center justify-center border border-neutral-800 shrink-0 text-neutral-400">
                  <span className="material-symbols-outlined text-lg">assignment</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-orange-500 transition-colors">
                    {task.title}
                  </h4>
                  <p className="font-mono text-[9px] text-neutral-500 mt-0.5">
                    ETA: {task.estimatedEffort} hours • Due: {new Date(task.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className={`font-mono text-[10px] font-black ${task.priorityScore >= 90 ? "text-orange-500" : "text-emerald-400"}`}>
                    {task.priorityScore} SCORE
                  </p>
                  <p className="font-mono text-[9px] text-neutral-500 uppercase tracking-wider">
                    {task.riskScore >= 75 ? "High Risk" : "Stable"}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate("tasks")}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-orange-500/10 text-neutral-400 hover:text-orange-500"
                >
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
