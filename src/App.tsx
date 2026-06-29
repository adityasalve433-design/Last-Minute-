/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { getAppState, saveAppState, AppState } from "./lib/store";
import { UserProfile, Task, Goal, Milestone, Habit, CalendarEvent, ProductivityAnalytics, AIRecommendation } from "./types";

// Component imports
import LandingPage from "./components/LandingPage";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import TaskManager from "./components/TaskManager";
import AIPlanner from "./components/AIPlanner";
import GoalTracker from "./components/GoalTracker";
import HabitTracker from "./components/HabitTracker";
import AnalyticsView from "./components/AnalyticsView";
import AICopilot from "./components/AICopilot";
import VoiceAssistant from "./components/VoiceAssistant";
import SettingsView from "./components/SettingsView";

export default function App() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Load state on mount
  useEffect(() => {
    setAppState(getAppState());
  }, []);

  if (!appState) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono text-orange-500 uppercase tracking-widest animate-pulse font-bold">
            Booting Omni Mind OS...
          </p>
        </div>
      </div>
    );
  }

  const { user, tasks, goals, milestones, habits, calendarEvents, analytics, recommendations } = appState;

  // Sync state helpers
  const updateState = (updater: (prev: AppState) => AppState) => {
    setAppState((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      saveAppState(next);
      return next;
    });
  };

  const handleAddGoal = (g: Goal) => {
    updateState((prev) => ({
      ...prev,
      goals: [...prev.goals, g]
    }));
  };

  const handleUpdateGoal = (g: Goal) => {
    updateState((prev) => ({
      ...prev,
      goals: prev.goals.map((item) => (item.goalId === g.goalId ? g : item))
    }));
  };

  const handleAddMilestone = (m: Milestone) => {
    updateState((prev) => ({
      ...prev,
      milestones: [...prev.milestones, m]
    }));
  };

  const handleUpdateMilestone = (m: Milestone) => {
    updateState((prev) => ({
      ...prev,
      milestones: prev.milestones.map((item) => (item.milestoneId === m.milestoneId ? m : item))
    }));
  };

  const handleAddHabit = (h: Habit) => {
    updateState((prev) => ({
      ...prev,
      habits: [...prev.habits, h]
    }));
  };

  const handleUpdateHabit = (h: Habit) => {
    updateState((prev) => ({
      ...prev,
      habits: prev.habits.map((item) => (item.habitId === h.habitId ? h : item))
    }));
  };

  const handleAddCalendarEvent = (e: CalendarEvent) => {
    updateState((prev) => ({
      ...prev,
      calendarEvents: [...prev.calendarEvents, e]
    }));
  };

  const handleAddTask = (t: Task) => {
    updateState((prev) => ({
      ...prev,
      tasks: [t, ...prev.tasks]
    }));
  };

  const handleUpdateTask = (t: Task) => {
    updateState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((item) => (item.taskId === t.taskId ? t : item))
    }));
  };

  const handleDeleteTask = (tId: string) => {
    updateState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((item) => item.taskId !== tId)
    }));
  };

  const handleUpdateUser = (p: UserProfile) => {
    updateState((prev) => ({
      ...prev,
      user: p
    }));
  };

  const handleOnboardingComplete = (profile: UserProfile, connectCalendar: boolean, importTemplateTasks: boolean) => {
    updateState((prev) => {
      const next = { ...prev };
      next.user = profile;
      next.isOnboarded = true;
      next.googleCalendarConnected = connectCalendar;

      if (!importTemplateTasks) {
        next.tasks = [];
        next.goals = [];
        next.milestones = [];
        next.habits = [];
        next.calendarEvents = [];
      }
      return next;
    });

    setOnboardingStep(false);
    setActiveTab("dashboard");
  };

  // Render Onboarding flow
  if (onboardingStep) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Render Welcome landing if user profile is cleared or un-onboarded
  if (!user) {
    return <LandingPage onStartOnboarding={() => setOnboardingStep(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col md:flex-row text-neutral-200 font-sans">
      
      {/* 1. LEFT COMPANION SIDEBAR */}
      <aside className="w-full md:w-64 shrink-0 bg-neutral-950/50 border-b md:border-b-0 md:border-r border-neutral-800 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]">
              <span className="material-symbols-outlined text-white text-xl">graphic_eq</span>
            </div>
            <div>
              <h1 className="font-display font-black text-lg tracking-tighter text-white leading-none">
                OMNI MIND
              </h1>
              <span className="font-mono text-[9px] text-orange-500 font-bold uppercase tracking-widest mt-0.5 block">
                AI COMPANION
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: "space_dashboard" },
              { id: "tasks", label: "Trajectory", icon: "assignment" },
              { id: "planner", label: "AI Planner", icon: "calendar_month" },
              { id: "goals", label: "Goals Tracker", icon: "track_changes" },
              { id: "habits", label: "Streak Loops", icon: "alarm_on" },
              { id: "analytics", label: "Productivity Cockpit", icon: "speed" },
              { id: "copilot", label: "AI Copilot", icon: "smart_toy" },
              { id: "voice", label: "Voice Assistant", icon: "graphic_eq" },
              { id: "settings", label: "System Calibration", icon: "settings" }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-xs transition-all ${
                    active
                      ? "bg-neutral-800/50 text-white border border-neutral-700/50 shadow-[0_0_15px_rgba(234,88,12,0.1)] font-bold"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/20"
                  }`}
                >
                  <span className={`material-symbols-outlined text-lg ${active ? "text-orange-500" : "text-neutral-500"}`}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info showing workspace status */}
        <div className="pt-6 border-t border-neutral-800 mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-display text-xs font-bold text-white uppercase shadow-md">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-white truncate max-w-[140px]">{user.name}</p>
              <p className="font-mono text-[9px] text-neutral-500 capitalize">{user.role}</p>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl text-[9px] font-mono text-neutral-400 leading-relaxed">
            <div className="flex justify-between items-center text-orange-500 font-bold mb-2">
              <span>SECURITY STATUS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
            </div>
            SERVER SIDE PROXY SECURED
          </div>
        </div>
      </aside>

      {/* 2. MAIN COCKPIT VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A]">
        
        {/* Global Action Header */}
        <header className="h-20 border-b border-neutral-800 flex items-center justify-between px-8 bg-[#070707]">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-neutral-800 rounded text-xs font-mono text-neutral-300">
              /dashboard/{activeTab}
            </div>
          </div>

          {/* Quick status dots */}
          <div className="flex items-center gap-6">
            <span className="text-xs text-neutral-500 uppercase tracking-widest hidden sm:inline">
              Status: Syncing with Calendar
            </span>
            <div className="flex items-center gap-3 text-xs text-neutral-300">
              <span className="flex items-center gap-1.5 font-mono text-[10px] bg-neutral-900 border border-neutral-800 px-2 py-1 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                UTC 2026-06-25
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Routing viewport content */}
        <div className="flex-1 p-8 overflow-y-auto scroll-hide">
          {activeTab === "dashboard" && (
            <Dashboard
              user={user}
              tasks={tasks}
              goals={goals}
              habits={habits}
              recommendations={recommendations}
              onNavigate={setActiveTab}
              onUpdateTask={handleUpdateTask}
            />
          )}

          {activeTab === "tasks" && (
            <TaskManager
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === "planner" && (
            <AIPlanner
              tasks={tasks}
              calendarEvents={calendarEvents}
              onAddCalendarEvent={handleAddCalendarEvent}
            />
          )}

          {activeTab === "goals" && (
            <GoalTracker
              goals={goals}
              milestones={milestones}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onAddMilestone={handleAddMilestone}
              onUpdateMilestone={handleUpdateMilestone}
            />
          )}

          {activeTab === "habits" && (
            <HabitTracker
              habits={habits}
              onAddHabit={handleAddHabit}
              onUpdateHabit={handleUpdateHabit}
            />
          )}

          {activeTab === "analytics" && analytics && (
            <AnalyticsView analytics={analytics} />
          )}

          {activeTab === "copilot" && (
            <AICopilot
              tasks={tasks}
              goals={goals}
              habits={habits}
              onAddTask={handleAddTask}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === "voice" && (
            <VoiceAssistant
              onAddTask={handleAddTask}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView
              user={user}
              onUpdateUser={handleUpdateUser}
            />
          )}
        </div>
      </main>
    </div>
  );
}
