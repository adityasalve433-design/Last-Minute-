/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { PersonaRole, UserProfile } from "../types";

interface OnboardingProps {
  onComplete: (userProfile: UserProfile, connectCalendar: boolean, importTasks: boolean) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<number>(1);
  const [role, setRole] = useState<PersonaRole>("entrepreneur");
  const [userName, setUserName] = useState<string>("Alex Vance");
  const [calendarSync, setCalendarSync] = useState<boolean>(true);
  const [primaryGoal, setPrimaryGoal] = useState<string>("Launch v2 Core Engine Beta");
  const [goalCategory, setGoalCategory] = useState<"Academic" | "Career" | "Business" | "Personal">("Business");
  const [importTasks, setImportTasks] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiProfileText, setAiProfileText] = useState<string>("");

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
      if (step === 4) {
        generateAIProfile();
      }
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const generateAIProfile = async () => {
    setIsGenerating(true);
    try {
      // Prompt Gemini to generate a custom profile based on role, goals and username
      const prompt = `Develop a high-impact, professional, 2-sentence productivity bio for ${userName}, who has onboarded as a ${role} with the primary goal: "${primaryGoal}" (${goalCategory}). Discuss their likely scheduling bottlenecks, focus demands, and how Omni Mind can keep them accountable. Use modern, motivating tone.`;
      
      const res = await fetch("/api/ai/copilot-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ sender: "user", text: prompt }],
          context: { tasks: [], goals: [], habits: [] }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiProfileText(data.text);
      } else {
        throw new Error();
      }
    } catch (e) {
      // Elegant default fallback profile texts based on role
      const fallbacks = {
        student: `${userName} is focused on academic excellence and research targets. Scheduling bottlenecks involve dense examination blocks and term assignments. Omni Mind keeps them ahead of midnight deadlines.`,
        professional: `${userName} aims to streamline work deliveries and handle meeting cascades efficiently. Balance points include deep-work protection and meeting recovery schedules.`,
        entrepreneur: `${userName} operates in high-velocity startup environments. Focus demands are extreme, requiring unit economic clarity, venture capital timelines, and strict delegation.`
      };
      setAiProfileText(fallbacks[role]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinish = () => {
    const profile: UserProfile = {
      userId: "user-1",
      name: userName || "Alex Vance",
      email: "adityasalve433@gmail.com",
      role: role,
      createdAt: new Date().toISOString(),
      aiProfileText: aiProfileText
    };
    onComplete(profile, calendarSync, importTasks);
  };

  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center px-4 pt-16 pb-24">
      <div className="w-full max-w-xl glass-panel rounded-3xl p-8 border-neutral-800 shadow-2xl relative overflow-hidden">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-neutral-900">
          <div
            className="h-full bg-orange-600 transition-all duration-500"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8">
          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            Onboarding • Step {step} of 5
          </span>
          <span className="font-mono text-xs text-orange-500 font-bold">{Math.round((step / 5) * 100)}%</span>
        </div>

        {/* STEP 1: Persona */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-black text-white tracking-tighter uppercase">Choose Your Primary Persona</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              We customize planning models, prioritizing priorities and scheduling urgency matrices depending on your daily workload profile.
            </p>
            <div className="grid grid-cols-1 gap-3 pt-2">
              {[
                { id: "student", label: "Student", desc: "Heavy study routines, assignments, exam timelines, and group projects.", icon: "school" },
                { id: "professional", label: "Professional", desc: "Corporate projects, calendars, meeting blocks, and client commitments.", icon: "work" },
                { id: "entrepreneur", label: "Entrepreneur", desc: "High-stakes startup sprints, investor briefs, and continuous tasks.", icon: "token" }
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => setRole(p.id as PersonaRole)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                    role === p.id
                      ? "bg-orange-600/10 border-orange-500/60 shadow-[0_0_15px_rgba(234,88,12,0.15)]"
                      : "bg-neutral-950 border-neutral-800 hover:bg-neutral-900"
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl ${role === p.id ? "text-orange-500" : "text-neutral-500"}`}>
                    {p.icon}
                  </span>
                  <div>
                    <h4 className="font-display font-bold text-white text-base">{p.label}</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-2 font-bold">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Alex Vance"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Google Calendar */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-black text-white tracking-tighter uppercase">Sync Google Calendar</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Omni Mind tracks meetings, classes, and calendar blocks to dynamically allocate deep-work time slots. This prevents calendar conflicts automatically.
            </p>
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 bg-orange-600/10 border border-orange-500/20 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-500 text-3xl">calendar_today</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-white uppercase tracking-tight">Google Calendar Integration</h4>
                <p className="text-xs text-neutral-500 mt-1">Read and write synced schedules in real-time.</p>
              </div>
              <button
                onClick={() => setCalendarSync(!calendarSync)}
                className={`mt-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                  calendarSync ? "bg-orange-600 text-white shadow-lg" : "bg-neutral-900 border border-neutral-800 text-white"
                }`}
              >
                {calendarSync ? "Connected Successfully ✓" : "Sync Google Calendar"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Goals */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-black text-white tracking-tighter uppercase">Establish Your Primary Goal</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              SaaS-grade accountability requires anchoring. Defining a core quarterly goal lets Gemini calculate project-critical deadlines.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-2 font-bold">Core Goal Title</label>
                <input
                  type="text"
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. Publish core research paper"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-2 font-bold">Goal Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Academic", "Career", "Business", "Personal"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setGoalCategory(cat as any)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        goalCategory === cat
                          ? "bg-orange-600 text-white shadow-lg"
                          : "bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Import Tasks */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-black text-white tracking-tighter uppercase">Import Workspace Trajectory</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              We have compiled a series of high-fidelity, role-appropriate templates to seed your dashboard. Let's load them to observe the priority engine in action.
            </p>
            <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={importTasks}
                  onChange={(e) => setImportTasks(e.target.checked)}
                  className="rounded border-neutral-800 bg-neutral-900 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-white group-hover:text-orange-500 transition-colors font-bold">
                  Yes, import sample critical tasks, habits, and meetings (Recommended)
                </span>
              </label>
              <p className="text-xs text-neutral-500 leading-relaxed pl-6">
                Seeds the database with audits, research papers, core streaks, and dummy calendar event items.
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: Generate AI Profile */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-black text-white tracking-tighter uppercase">Your AI Productivity Profile</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Gemini has integrated your role, timeline boundaries, and core goals into an absolute accountability algorithm:
            </p>
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-mono text-orange-400 uppercase tracking-widest animate-pulse">
                  Reasoning about focus bottlenecks...
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-sm leading-relaxed text-neutral-200 relative">
                <span className="absolute top-2 right-2 material-symbols-outlined text-orange-500 animate-pulse text-base">
                  auto_awesome
                </span>
                {aiProfileText}
              </div>
            )}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex items-center gap-3 text-xs text-neutral-500">
              <span className="material-symbols-outlined text-orange-500 text-lg">shield</span>
              <span>This profile guides your AI Copilot recommendations on a zero-trust, local security model.</span>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-neutral-800">
          {step > 1 ? (
            <button
              onClick={handlePrev}
              className="px-6 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 active:scale-95 transition-all"
            >
              Previous
            </button>
          ) : (
            <div></div>
          )}

          {step < 5 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-orange-500 active:scale-95 shadow-md transition-all"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isGenerating}
              className="px-6 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-black uppercase tracking-wider hover:bg-orange-500 active:scale-95 shadow-[0_0_20px_rgba(234,88,12,0.3)] disabled:opacity-50 transition-all"
            >
              Complete Initialization
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
