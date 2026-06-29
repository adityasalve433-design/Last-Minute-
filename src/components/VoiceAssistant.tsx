/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Task } from "../types";
import { processVoiceCommandWithAI } from "../lib/gemini";

interface VoiceAssistantProps {
  onAddTask: (task: Task) => void;
  onNavigate: (tab: string) => void;
}

export default function VoiceAssistant({ onAddTask, onNavigate }: VoiceAssistantProps) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [aiOutput, setAiOutput] = useState<string>("Press the glow button or select a quick spoken command to begin.");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleVoiceCommand = async (spokenText: string) => {
    setIsProcessing(true);
    setTranscript(spokenText);
    setAiOutput("Processing command structures with Gemini...");

    try {
      const result = await processVoiceCommandWithAI(spokenText);
      setAiOutput(result.text);

      // Execute AI action automatically!
      if (result.actionDetected === "add_task" && result.extractedData) {
        const ext = result.extractedData;
        const days = ext.deadlineDaysFromNow || 2;
        const deadlineDate = new Date();
        d.setDate(deadlineDate.getDate() + days);

        const newTask: Task = {
          taskId: `t-voice-${Date.now()}`,
          userId: "user-1",
          title: ext.title || "Voice Action Task",
          description: "Synthesized automatically via Omni Mind voice assistant.",
          deadline: deadlineDate.toISOString(),
          priorityScore: 85,
          riskScore: 70,
          estimatedEffort: ext.effortEstimate || 2,
          status: "todo",
          createdAt: new Date().toISOString(),
          tags: ["Voice-Captured", "Sprint"],
          subtasks: [
            { title: "Define specifications", completed: false },
            { title: "Complete design brief", completed: false }
          ],
          aiActionAdvice: "Auto-saved. Review priority list to calibrate calendar time blocks."
        };
        onAddTask(newTask);
      } else if (result.actionDetected === "plan_week") {
        setTimeout(() => onNavigate("planner"), 1500);
      }
    } catch (e) {
      console.error("Voice process failed:", e);
      setAiOutput("I encountered a connection error. Verify your API key is in the secrets panel!");
    } finally {
      setIsProcessing(false);
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Simulate stopped speech
      handleVoiceCommand("Add assignment due Friday");
    } else {
      setIsRecording(true);
      setTranscript("Listening carefully...");
      setAiOutput("Speak your command...");
    }
  };

  const handleQuickSpokenCmd = (cmd: string) => {
    handleVoiceCommand(cmd);
  };

  // Helper date variable for voice calculation
  const d = new Date();

  return (
    <div className="space-y-8 max-w-xl mx-auto w-full text-center py-8 animate-pulse-soft">
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-black text-white tracking-tighter uppercase">
          AI Voice Assistant
        </h2>
        <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mx-auto">
          Say a command like &quot;Plan my week&quot; or &quot;Add task 'Audit' due in 3 days&quot;.
        </p>
      </div>

      {/* Main glowing voice button */}
      <div className="flex flex-col items-center justify-center py-10 space-y-6">
        <button
          onClick={toggleRecording}
          className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
            isRecording
              ? "bg-red-500 hover:bg-red-400 scale-105 shadow-[0_0_40px_rgba(239,68,68,0.5)]"
              : "bg-orange-600 hover:bg-orange-500 hover:scale-105 shadow-[0_0_35px_rgba(234,88,12,0.4)]"
          }`}
        >
          <span className="material-symbols-outlined text-white text-4xl font-bold">
            {isRecording ? "mic" : "graphic_eq"}
          </span>

          {/* Decorative glowing ripple rings */}
          {isRecording && (
            <>
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25"></span>
              <span className="absolute -inset-4 rounded-full bg-red-500 animate-pulse opacity-10"></span>
            </>
          )}
        </button>

        <p className="font-mono text-[10px] text-orange-500 uppercase tracking-widest animate-pulse font-bold">
          {isRecording ? "Active Capture Mode • Speak Now" : "Tap to Speak Command"}
        </p>
      </div>

      {/* Quick Spoken Pills */}
      <div className="space-y-3">
        <h4 className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-bold">
          Quick Spoken Prompts
        </h4>
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            "Add task Finish Case Study due in 2 days",
            "Plan my week",
            "Prepare interview schedule for tomorrow"
          ].map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickSpokenCmd(cmd)}
              className="px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-orange-500/30 text-xs text-neutral-400 hover:text-white transition-all active:scale-95 font-bold"
            >
              &ldquo;{cmd}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Transcription and AI Responses */}
      <div className="space-y-4 pt-4 text-left">
        {transcript && (
          <div className="glass-card p-4 rounded-xl border-neutral-800 space-y-1">
            <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-wider font-bold">
              Transcription Input
            </span>
            <p className="text-xs text-white italic font-sans">&ldquo;{transcript}&rdquo;</p>
          </div>
        )}

        <div className="glass-card p-5 rounded-2xl border-neutral-800 space-y-2 relative overflow-hidden min-h-[100px]">
          <span className="absolute top-3 right-3 material-symbols-outlined text-orange-500 text-base animate-pulse">
            auto_awesome
          </span>
          <span className="font-mono text-[9px] text-orange-500 uppercase tracking-wider block font-bold">
            Companion AI Command Action
          </span>
          
          {isProcessing ? (
            <div className="flex items-center gap-2 pt-2">
              <div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-neutral-400 animate-pulse font-mono uppercase tracking-widest font-bold">
                Extracting action nodes...
              </p>
            </div>
          ) : (
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">{aiOutput}</p>
          )}
        </div>
      </div>
    </div>
  );
}
