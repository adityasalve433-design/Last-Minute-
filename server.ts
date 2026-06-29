/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Securely instantiate the Google GenAI SDK (lazy-loaded or optional fallback)
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Falling back to rule-based responses.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy_key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

const app = express();
app.use(express.json());

const PORT = 3000;

// ==========================================
// CENTRALIZED AI ENDPOINTS
// ==========================================

// 1. PRIORITY SCORING AGENT
app.post("/api/ai/score-task", async (req, res) => {
  const { taskTitle, taskDesc, deadline } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      priorityScore: 78,
      riskScore: 65,
      estimatedEffort: 3,
      aiActionAdvice: "Start by defining the smallest viable deliverable. Break tasks down to prevent scheduling overhead. [GEMINI API KEY MISSING]",
      tags: ["High Urgency", "Audit"],
      subtasks: [
        { title: "Define immediate task scope", completed: false },
        { title: "Execute core draft block", completed: false }
      ]
    });
  }

  try {
    const ai = getGenAI();
    const systemPrompt = `You are the Priority & Risk Scoring module of Omni Mind.
Analyze the user's task and deadline, and produce:
1. priorityScore: Integer (1 to 100) based on urgency and importance.
2. riskScore: Integer (1 to 100) of missing the deadline.
3. estimatedEffort: Float (hours required).
4. aiActionAdvice: 1-2 sentence hyper-specific proactive productivity coaching advice.
5. tags: 2-3 relevant tags.
6. subtasks: A list of 3-4 structured subtask titles to execute the work immediately.

Always return the response in strict JSON format matching the schema provided.`;

    const promptText = `Task Title: "${taskTitle}"
Task Description: "${taskDesc}"
Deadline: ${deadline}
Current Time: ${new Date().toISOString()}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priorityScore: { type: Type.INTEGER },
            riskScore: { type: Type.INTEGER },
            estimatedEffort: { type: Type.NUMBER },
            aiActionAdvice: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            subtasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  completed: { type: Type.BOOLEAN }
                },
                required: ["title", "completed"]
              }
            }
          },
          required: ["priorityScore", "riskScore", "estimatedEffort", "aiActionAdvice", "tags"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error) {
    console.error("AI Task Scoring error on server:", error);
    res.status(500).json({ error: "AI reasoning failure" });
  }
});

// 2. DAILY PLANNER (SCHEDULE OPTIMIZATION AGENT)
app.post("/api/ai/optimize-schedule", async (req, res) => {
  const { tasks, events, availabilityHours } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      schedule: (tasks || []).map((t: any, idx: number) => ({
        title: `Deep Work: ${t.title}`,
        startTime: `${9 + idx}:00`,
        endTime: `${10 + idx}:00`,
        taskId: t.taskId,
        notes: "Auto-prioritized block."
      })),
      coachingAdvice: "Plan your day with strict deep-work boundaries. Avoid meeting overlaps."
    });
  }

  try {
    const ai = getGenAI();
    const systemPrompt = `You are the Schedule Optimization Agent of Omni Mind.
Analyze the list of pending tasks (sorted by risk/priority) and pre-existing calendar meetings.
Allocate direct hour/time-blocks for today (between 09:00 and 18:00) that resolve calendar conflicts, break down tasks into actionable sprints, and allocate buffer periods.

Produce:
1. schedule: Array of timeblocks containing:
   - title (e.g. 'Deep Work on Audit', 'Buffer & Inbox Zero')
   - startTime (HH:MM format)
   - endTime (HH:MM format)
   - taskId (optional target task ID)
   - notes (specific action to execute)
2. coachingAdvice: 1 general productivity coaching recommendation for the day.

Return raw JSON matching the schema provided.`;

    const promptText = `Tasks: ${JSON.stringify(tasks)}
Meetings: ${JSON.stringify(events)}
Daily Availability: ${availabilityHours} hours`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  taskId: { type: Type.STRING },
                  notes: { type: Type.STRING }
                },
                required: ["title", "startTime", "endTime"]
              }
            },
            coachingAdvice: { type: Type.STRING }
          },
          required: ["schedule", "coachingAdvice"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error) {
    console.error("Schedule optimization error on server:", error);
    res.status(500).json({ error: "AI planner error" });
  }
});

// 3. AI COPILOT CHAT INTERFACE
app.post("/api/ai/copilot-chat", async (req, res) => {
  const { messages, context } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      id: Math.random().toString(),
      sender: "assistant",
      text: "Hello! I am your Omni Mind AI Copilot. To leverage the power of real-time Gemini reasoning (including task breakdown, interview prep, and coaching), please add your GEMINI_API_KEY in the Secrets menu. In the meantime, look at your primary dashboard for focus directions!",
      timestamp: new Date().toISOString()
    });
  }

  try {
    const ai = getGenAI();
    const systemPrompt = `You are Omni Mind, an elite proactive productivity companion.
Your mission is to help users complete tasks, achieve goals, and sustain habits before deadlines slip.
Always prioritize active steps over passive warnings. Recommend concrete next tasks, help break down projects, or draft outlines immediately based on the user's inquiry.

User context:
Tasks: ${JSON.stringify(context.tasks || [])}
Goals: ${JSON.stringify(context.goals || [])}
Habits: ${JSON.stringify(context.habits || [])}

Speak in a modern, professional, encouraging startup-grade voice.
Suggest specific actionable next steps at the end of your response, and keep formatting clean using markdown.`;

    // Construct history for Gemini generateContent
    const contentsPayload = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentsPayload,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    // Extract suggested actions based on response text using high-fidelity heuristics
    const text = response.text || "";
    const suggestedActions = [];
    if (text.toLowerCase().includes("break down")) {
      suggestedActions.push({ label: "Break down task t-1", action: "break_down", payload: { taskId: "t-1" } });
    }
    if (text.toLowerCase().includes("schedule") || text.toLowerCase().includes("plan")) {
      suggestedActions.push({ label: "Optimize my daily plan", action: "plan_day" });
    }

    res.json({
      id: Math.random().toString(),
      sender: "assistant",
      text: text,
      timestamp: new Date().toISOString(),
      suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined
    });
  } catch (error) {
    console.error("AI Copilot chat error on server:", error);
    res.status(500).json({ error: "AI chat connection failed" });
  }
});

// 4. VOICE ASSISTANT AGENT (TRANSCRIPTION & COMMAND EXTRACTION)
app.post("/api/ai/voice-command", async (req, res) => {
  const { voiceTranscript } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      text: `Parsed voice command: "${voiceTranscript}" (Simulated response - configure GEMINI_API_KEY for true voice parsing).`,
      actionDetected: "none"
    });
  }

  try {
    const ai = getGenAI();
    const systemInstruction = `You are the Voice Processing module of Omni Mind.
Analyze the user's spoken text transcript, and output:
1. text: A warm, clear acknowledgement of what they asked.
2. actionDetected: Exactly one of: "add_task", "plan_week", "prep_interview", "none"
3. extractedData: A structured dictionary of details found. E.g.:
   - For "add_task": { title: "Spoken task", deadlineDaysFromNow: Number, effortEstimate: Number }
   - For "plan_week": {}
   - For "prep_interview": { role: "Product Designer" }

Return raw JSON matching the schema provided.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: voiceTranscript,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            actionDetected: { type: Type.STRING },
            extractedData: { type: Type.OBJECT }
          },
          required: ["text", "actionDetected"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error) {
    console.error("Voice processing error on server:", error);
    res.status(500).json({ error: "Voice module reasoning failure" });
  }
});

// 5. GOAL FORECAST AGENT
app.post("/api/ai/forecast-goal", async (req, res) => {
  const { goal, milestones } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      probability: 75,
      rationale: "Progressing smoothly. Fast-track remaining milestones to minimize deadline risks."
    });
  }

  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Goal: "${goal.title}" in category "${goal.category}" with current progress ${goal.progress}% and target date ${goal.targetDate}. Milestones: ${JSON.stringify(milestones)}.`,
      config: {
        systemInstruction: "You are the Goal Forecasting module of Omni Mind. Calculate a success probability percentage (0 to 100) and a brief 1-sentence analytical rationale explaining the forecasting bottlenecks. Output raw JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            probability: { type: Type.INTEGER },
            rationale: { type: Type.STRING }
          },
          required: ["probability", "rationale"]
        }
      }
    });
    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error) {
    console.error("Goal forecast error:", error);
    res.status(500).json({ error: "Forecaster failed" });
  }
});

// 6. HABIT COACHING INSIGHTS
app.post("/api/ai/habit-coaching", async (req, res) => {
  const { habit } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      coaching: "Establish a daily trigger time. Complete the habit block as your first victory."
    });
  }

  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Habit: "${habit.title}" with streak: ${habit.streak}, completionRate: ${habit.completionRate}%.`,
      config: {
        systemInstruction: "You are the Habit Coaching module of Omni Mind. Write a 1-sentence high-impact motivation and tactical advice trigger based on James Clear's Atomic Habits principles. Output raw JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coaching: { type: Type.STRING }
          },
          required: ["coaching"]
        }
      }
    });
    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error) {
    console.error("Habit coaching error:", error);
    res.status(500).json({ error: "Coaching failed" });
  }
});

// ==========================================
// STATIC VITE DEVELOPMENT & PRODUCTION MIX
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Omni Mind] Full-stack container online at http://0.0.0.0:${PORT}`);
  });
}

startServer();
