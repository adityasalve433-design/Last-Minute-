/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, Task, Goal, Habit } from "../types";
import { getAICopilotResponse } from "../lib/gemini";

interface AICopilotProps {
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  onAddTask: (task: Task) => void;
  onNavigate: (tab: string) => void;
}

export default function AICopilot({
  tasks,
  goals,
  habits,
  onAddTask,
  onNavigate
}: AICopilotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      sender: "assistant",
      text: `Hello, Alex. I am your Omni Mind AI Copilot. I analyze your deadlines, goals, and daily trajectory in real-time. 

How can I accelerate your day? Select a quick command or write a custom query.`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await getAICopilotResponse([...messages, userMsg], { tasks, goals, habits });
      setMessages((prev) => [...prev, response]);
    } catch (e) {
      console.error("Copilot request error:", e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (actionType: string) => {
    let prompt = "";
    if (actionType === "break_down") {
      prompt = "Please analyze my highest risk task, 'Quarterly Data Infrastructure Audit', and break it down into a highly actionable, hour-by-hour sprint list.";
    } else if (actionType === "plan") {
      prompt = "Generate my daily schedule around today's pre-existing meetings and highlight optimal focus windows.";
    } else if (actionType === "interview") {
      prompt = "I need to prepare for my Senior Product Design interview tomorrow at 10 AM. Help me structure my case study presentation and draft a study syllabus.";
    }
    handleSendMessage(prompt);
  };

  const executeSuggestedAction = (act: any) => {
    if (act.action === "break_down") {
      // Simulate creating a subtask or adjusting task
      alert("AI Command: Actioning task breakdown on Trajectory!");
      onNavigate("tasks");
    } else if (act.action === "plan_day") {
      onNavigate("planner");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] relative max-w-4xl mx-auto w-full">
      {/* Scrollable Messages Stream */}
      <div className="flex-1 overflow-y-auto scroll-hide pb-28 space-y-6 px-1">
        {messages.map((m) => {
          const isAssistant = m.sender === "assistant";
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}
            >
              <div className="flex items-start gap-3.5 max-w-[85%]">
                {isAssistant && (
                  <div className="w-8 h-8 rounded-lg bg-orange-600/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-orange-500 text-sm">smart_toy</span>
                  </div>
                )}
                <div className="space-y-3">
                  <div
                    className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                      isAssistant
                        ? "bg-neutral-900 text-white border-l-4 border-l-orange-600 border-t border-r border-b border-neutral-800"
                        : "bg-neutral-950 border border-neutral-800 text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>

                  {/* Executable suggested actions nested in Assistant replies */}
                  {isAssistant && m.suggestedActions && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {m.suggestedActions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => executeSuggestedAction(act)}
                          className="px-3 py-1.5 rounded-lg bg-orange-600/10 border border-orange-500/20 text-[10px] font-mono font-bold text-orange-400 hover:bg-orange-600/20 transition-all flex items-center gap-1 uppercase tracking-wider"
                        >
                          <span className="material-symbols-outlined text-xs">settings_input_component</span>
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing thinking state indicator */}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600/10 border border-orange-500/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-orange-500 text-sm animate-spin">sync</span>
            </div>
            <span className="font-mono text-[10px] text-orange-500 uppercase tracking-widest animate-pulse font-bold">
              Gemini is reasoning in real-time...
            </span>
          </div>
        )}
        <div ref={bottomRef}></div>
      </div>

      {/* Floating Bottom Input & Quick Actions Section */}
      <div className="absolute bottom-0 left-0 w-full pt-4 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent">
        {/* Quick Command Pills */}
        <div className="flex gap-2 overflow-x-auto scroll-hide pb-3 px-1">
          <button
            onClick={() => handleQuickAction("break_down")}
            className="shrink-0 px-4 py-2 rounded-full bg-neutral-950 border border-neutral-800 hover:border-orange-500/30 transition-all flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white font-bold"
          >
            <span className="material-symbols-outlined text-orange-500 text-sm">account_tree</span>
            Break down task
          </button>
          <button
            onClick={() => handleQuickAction("plan")}
            className="shrink-0 px-4 py-2 rounded-full bg-neutral-950 border border-neutral-800 hover:border-orange-500/30 transition-all flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white font-bold"
          >
            <span className="material-symbols-outlined text-orange-500 text-sm">calendar_month</span>
            Optimize day schedule
          </button>
          <button
            onClick={() => handleQuickAction("interview")}
            className="shrink-0 px-4 py-2 rounded-full bg-neutral-950 border border-neutral-800 hover:border-orange-500/30 transition-all flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white font-bold"
          >
            <span className="material-symbols-outlined text-orange-500 text-sm">record_voice_over</span>
            Prep for interview
          </button>
        </div>

        {/* Input Bar */}
        <div className="relative glass-card rounded-2xl p-2 flex items-end gap-2 border-neutral-800 focus-within:border-orange-500/50 transition-all shadow-xl">
          <button className="p-3 text-neutral-400 hover:text-orange-500 transition-colors shrink-0">
            <span className="material-symbols-outlined">attach_file</span>
          </button>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(inputText);
              }
            }}
            placeholder="Delegate a task, ask for a study schedule, or prep interview outlines..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white text-sm py-3 resize-none max-h-24 scroll-hide focus:outline-none"
            rows={1}
          />
          <button
            onClick={() => handleSendMessage(inputText)}
            className="p-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-md shrink-0 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-base">send</span>
          </button>
        </div>
        <p className="text-center text-[9px] text-neutral-500 uppercase tracking-widest font-bold mt-3 pb-2">
          Omni Mind Copilot is connected securely. Real-time reasoning active.
        </p>
      </div>
    </div>
  );
}
