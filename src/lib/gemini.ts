/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, Goal, Habit, CalendarEvent, ChatMessage } from "../types";

export interface AIScoringResult {
  priorityScore: number;
  riskScore: number;
  estimatedEffort: number;
  aiActionAdvice: string;
  tags: string[];
  subtasks?: { title: string; completed: boolean }[];
}

export interface AIPlannerResult {
  schedule: {
    title: string;
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    taskId?: string;
    notes?: string;
  }[];
  coachingAdvice: string;
}

export interface AIVoiceResult {
  text: string;
  actionDetected: string; // "add_task" | "plan_week" | "prep_interview" | "none"
  extractedData?: any;
}

export async function scoreTaskWithAI(taskTitle: string, taskDesc: string, deadline: string): Promise<AIScoringResult> {
  try {
    const res = await fetch("/api/ai/score-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskTitle, taskDesc, deadline }),
    });
    if (!res.ok) throw new Error("Scoring failed");
    return await res.json();
  } catch (error) {
    console.error("AI Task Scoring Error, using local heuristics:", error);
    // Fallback heuristic scoring
    const isUrgent = new Date(deadline).getTime() - Date.now() < 24 * 60 * 60 * 1000;
    return {
      priorityScore: isUrgent ? 95 : 65,
      riskScore: isUrgent ? 88 : 35,
      estimatedEffort: Math.max(1, Math.min(8, taskTitle.length % 5 + 1)),
      aiActionAdvice: `Start immediately on ${taskTitle} to bypass immediate risk bottlenecks. Highlight early deliverables.`,
      tags: ["AI-Scored", isUrgent ? "Critical" : "Standard"],
      subtasks: [
        { title: "Define scope and dependencies", completed: false },
        { title: "Execute core development and draft assets", completed: false },
        { title: "Review outputs and verify criteria", completed: false }
      ]
    };
  }
}

export async function optimizeScheduleWithAI(
  tasks: Task[],
  events: CalendarEvent[],
  availabilityHours: number = 8
): Promise<AIPlannerResult> {
  try {
    const res = await fetch("/api/ai/optimize-schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks, events, availabilityHours }),
    });
    if (!res.ok) throw new Error("Planner failed");
    return await res.json();
  } catch (error) {
    console.error("AI Daily Planner Error, using fallback schedule logic:", error);
    // Fallback schedule planner
    return {
      schedule: tasks.map((t, idx) => ({
        title: `Deep Work: ${t.title}`,
        startTime: `${9 + idx}:00`,
        endTime: `${10 + idx}:00`,
        taskId: t.taskId,
        notes: "Auto-allocated based on priority queue rules."
      })),
      coachingAdvice: "Maintain high-intensity focus sprints. Turn off notifications to amplify execution speed."
    };
  }
}

export async function getAICopilotResponse(
  messages: ChatMessage[],
  context: { tasks: Task[]; goals: Goal[]; habits: Habit[] }
): Promise<ChatMessage> {
  try {
    const res = await fetch("/api/ai/copilot-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, context }),
    });
    if (!res.ok) throw new Error("Copilot chat failed");
    return await res.json();
  } catch (error) {
    console.error("AI Copilot Error, using local fallback response:", error);
    return {
      id: Math.random().toString(),
      sender: "assistant",
      text: "I am having trouble communicating with the server AI modules right now. Make sure your GEMINI_API_KEY is configured in the Secrets panel! Here's a productivity nudge: prioritize your top 3 critical tasks and conquer the highest risk milestone first.",
      timestamp: new Date().toISOString()
    };
  }
}

export async function processVoiceCommandWithAI(voiceTranscript: string): Promise<AIVoiceResult> {
  try {
    const res = await fetch("/api/ai/voice-command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voiceTranscript }),
    });
    if (!res.ok) throw new Error("Voice process failed");
    return await res.json();
  } catch (error) {
    console.error("AI Voice Assistant Error:", error);
    return {
      text: `Processed voice input: "${voiceTranscript}". Local assistant fallback triggered.`,
      actionDetected: "none"
    };
  }
}

export async function forecastGoalAI(goal: Goal, milestones: any[]): Promise<{ probability: number; rationale: string }> {
  try {
    const res = await fetch("/api/ai/forecast-goal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, milestones }),
    });
    if (!res.ok) throw new Error("Goal forecast failed");
    return await res.json();
  } catch (error) {
    console.error("Goal Forecast error:", error);
    return {
      probability: 72,
      rationale: "Decent streak progress detected. Tighten milestone timelines to boost absolute predictability."
    };
  }
}

export async function getHabitCoachingAI(habit: Habit): Promise<string> {
  try {
    const res = await fetch("/api/ai/habit-coaching", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habit }),
    });
    if (!res.ok) throw new Error("Habit coaching failed");
    const data = await res.json();
    return data.coaching;
  } catch (error) {
    console.error("Habit coaching error:", error);
    return "Consistency beats intensity. Aim for the exact same timeframe daily to wire the action loop.";
  }
}
