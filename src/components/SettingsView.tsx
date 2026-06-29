/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserProfile, PersonaRole } from "../types";

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export default function SettingsView({ user, onUpdateUser }: SettingsViewProps) {
  const [name, setName] = useState<string>(user.name);
  const [role, setRole] = useState<PersonaRole>(user.role);
  const [googleCalendarSync, setGoogleCalendarSync] = useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      role
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto w-full animate-pulse-soft">
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-black text-white tracking-tighter uppercase">
          System Settings
        </h2>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Calibrate your role model matrices, API integrations, and personal profiles.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-3xl border-neutral-800 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-500 mb-1.5 font-bold">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-500 mb-1.5 font-bold">
              Personal Persona Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as PersonaRole)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-semibold"
            >
              <option value="student" className="bg-neutral-900 text-white">Student / Academic</option>
              <option value="professional" className="bg-neutral-900 text-white">Professional / Builder</option>
              <option value="entrepreneur" className="bg-neutral-900 text-white">Entrepreneur / Startup Leader</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-xl border border-neutral-800">
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-white">Google Calendar Sync</h4>
              <p className="text-[10px] text-neutral-500 font-semibold">Sync and auto-block tasks around meetings.</p>
            </div>
            <button
              type="button"
              onClick={() => setGoogleCalendarSync(!googleCalendarSync)}
              className={`w-12 h-6 rounded-full p-1 transition-all ${
                googleCalendarSync ? "bg-orange-600" : "bg-neutral-800"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-all ${
                  googleCalendarSync ? "translate-x-6" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
          {saveSuccess ? (
            <span className="text-xs text-emerald-400 font-mono font-bold">Profile updated successfully ✓</span>
          ) : (
            <div></div>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/20 active:scale-95 transition-all uppercase tracking-wider"
          >
            Save Calibration
          </button>
        </div>
      </form>

      {/* Security Credentials info card */}
      <div className="glass-panel p-5 rounded-3xl border-neutral-800 space-y-3">
        <h4 className="font-display text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
          <span className="material-symbols-outlined text-orange-500 text-base">security</span>
          Zero-Trust Security Blueprint
        </h4>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Omni Mind relies exclusively on server-side proxy handlers for GenAI calculations. Your **GEMINI_API_KEY** is securely stored in Google AI Studio&apos;s isolated Secrets module and is never exposed to public browser assets or network tabs.
        </p>
      </div>
    </div>
  );
}
