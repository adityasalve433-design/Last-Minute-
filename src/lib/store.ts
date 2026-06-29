/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, Goal, Milestone, Habit, CalendarEvent, ProductivityAnalytics, AIRecommendation, UserProfile } from "../types";

const NEW_LOCAL_STORAGE_KEY = "omni_mind_store";
const OLD_LOCAL_STORAGE_KEY = "lastminute_ai_store";

export interface AppState {
  user: UserProfile | null;
  tasks: Task[];
  goals: Goal[];
  milestones: Milestone[];
  habits: Habit[];
  calendarEvents: CalendarEvent[];
  analytics: ProductivityAnalytics;
  recommendations: AIRecommendation[];
  isOnboarded: boolean;
  googleCalendarConnected: boolean;
}

// Generate beautiful, high-fidelity default values
const defaultState = (): AppState => {
  const today = new Date();
  
  // Tasks
  const task1Deadline = new Date(today.getTime() + 2.5 * 60 * 60 * 1000).toISOString(); // 2.5 hours from now
  const task2Deadline = new Date(today.getTime() + 5 * 60 * 60 * 1000).toISOString(); // 5 hours from now
  const task3Deadline = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
  const task4Deadline = new Date(today.getTime() + 72 * 60 * 60 * 1000).toISOString(); // 3 days from now

  const tasks: Task[] = [
    {
      taskId: "t-1",
      userId: "user-1",
      title: "Quarterly Data Infrastructure Audit",
      description: "Analyze AWS cluster costs, verify PostgreSQL database replicas, and prune dead table partitions. Sarah and Dave are blocked until completed.",
      deadline: task1Deadline,
      priorityScore: 98,
      riskScore: 94,
      estimatedEffort: 4,
      status: "todo",
      createdAt: today.toISOString(),
      tags: ["Infrastructure", "Finance", "Critical"],
      subtasks: [
        { title: "S3 storage usage review", completed: false },
        { title: "Query latency benchmark on replicas", completed: false },
        { title: "Identify unindexed outer keys", completed: false }
      ],
      aiActionAdvice: "Critical risk warning! This audit will take roughly 4 hours. Start today by 11:30 AM to avoid crashing Dave's deploy pipeline."
    },
    {
      taskId: "t-2",
      userId: "user-1",
      title: "Emergency Patch: v2.4 API Leak",
      description: "Close endpoint vulnerability leaking user auth hashes during oauth handshakes. Critical security task.",
      deadline: task2Deadline,
      priorityScore: 95,
      riskScore: 88,
      estimatedEffort: 2,
      status: "in_progress",
      createdAt: today.toISOString(),
      tags: ["Security", "Hotfix"],
      subtasks: [
        { title: "Revoke compromised tokens", completed: true },
        { title: "Re-encrypt auth callback fields", completed: false },
        { title: "Run static taint analysis", completed: false }
      ],
      aiActionAdvice: "Medium Effort, but high exposure rate. Allocate a dedicated deep work sprint immediately to ship code before noon."
    },
    {
      taskId: "t-3",
      userId: "user-1",
      title: "Prepare Seed Funding Deck v2",
      description: "Incorporate Series A feedback regarding retention trends and unit economics. Finalize cap table simulation model.",
      deadline: task3Deadline,
      priorityScore: 72,
      riskScore: 45,
      estimatedEffort: 8,
      status: "todo",
      createdAt: today.toISOString(),
      tags: ["Investor", "Business"],
      subtasks: [
        { title: "Update Cohort retention charts", completed: false },
        { title: "Review cap table with Legal", completed: false }
      ],
      aiActionAdvice: "8-hour high-impact effort. Breaking this down into two 4-hour modules over today and tomorrow morning is advised."
    },
    {
      taskId: "t-4",
      userId: "user-1",
      title: "Optimize LLM Context Window",
      description: "Implement retrieval-augmented clustering rules to trim redundant context variables passed to Gemini API routers.",
      deadline: task4Deadline,
      priorityScore: 54,
      riskScore: 10,
      estimatedEffort: 3,
      status: "completed",
      createdAt: today.toISOString(),
      tags: ["AI Engineering", "Routine"],
      subtasks: [
        { title: "Benchmark token use", completed: true },
        { title: "Add token trimmer middleware", completed: true }
      ],
      aiActionAdvice: "Task complete. Performance metrics confirm a 12% boost in pipeline velocity."
    }
  ];

  // Goals
  const goals: Goal[] = [
    {
      goalId: "g-1",
      userId: "user-1",
      title: "Close Seed Funding Round",
      progress: 65,
      targetDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Business",
      successProbability: 88
    },
    {
      goalId: "g-2",
      userId: "user-1",
      title: "Publish Core ML Research Paper",
      progress: 40,
      targetDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Academic",
      successProbability: 64
    },
    {
      goalId: "g-3",
      userId: "user-1",
      title: "Sustain High Flow Fitness Rating",
      progress: 80,
      targetDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Personal",
      successProbability: 95
    }
  ];

  // Milestones
  const milestones: Milestone[] = [
    { milestoneId: "m-1", goalId: "g-1", title: "Finalize Pitch Deck draft v2", status: "completed" },
    { milestoneId: "m-2", goalId: "g-1", title: "Complete Term Sheet discussions", status: "pending" },
    { milestoneId: "m-3", goalId: "g-2", title: "Benchmark prompt metrics on 1k tests", status: "pending" }
  ];

  // Habits
  const habits: Habit[] = [
    {
      habitId: "h-1",
      userId: "user-1",
      title: "Deep Work Core Programming Block",
      streak: 12,
      completionRate: 94,
      history: {
        "2026-06-20": true,
        "2026-06-21": true,
        "2026-06-22": true,
        "2026-06-23": true,
        "2026-06-24": true,
      },
      category: "study"
    },
    {
      habitId: "h-2",
      userId: "user-1",
      title: "High Intensity Cardio Flow",
      streak: 5,
      completionRate: 85,
      history: {
        "2026-06-21": true,
        "2026-06-22": true,
        "2026-06-23": false,
        "2026-06-24": true,
      },
      category: "exercise"
    },
    {
      habitId: "h-3",
      userId: "user-1",
      title: "Read 20 pages of Deep Work",
      streak: 8,
      completionRate: 90,
      history: {
        "2026-06-21": true,
        "2026-06-22": true,
        "2026-06-23": true,
        "2026-06-24": true,
      },
      category: "reading"
    }
  ];

  // Calendar Events
  const calendarEvents: CalendarEvent[] = [
    {
      eventId: "e-1",
      userId: "user-1",
      title: "Cap Table review with Dave & Sarah",
      startTime: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hrs ago
      endTime: new Date(today.getTime() - 1 * 60 * 60 * 1000).toISOString() // 1 hr ago
    },
    {
      eventId: "e-2",
      userId: "user-1",
      title: "Investor Q&A Session",
      startTime: new Date(today.getTime() + 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hr from now
      endTime: new Date(today.getTime() + 2.5 * 60 * 60 * 1000).toISOString() // 2.5 hr from now
    },
    {
      eventId: "e-3",
      userId: "user-1",
      title: "Sprint Retrospective: V2 Launch",
      startTime: new Date(today.getTime() + 6 * 60 * 60 * 1000).toISOString(), // 6 hrs from now
      endTime: new Date(today.getTime() + 7 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Analytics
  const analytics: ProductivityAnalytics = {
    analyticsId: "a-1",
    userId: "user-1",
    productivityScore: 92,
    completionRate: 88,
    focusTime: 36,
    missedDeadlines: 1,
    weeklyTrends: [
      { day: "Mon", score: 82 },
      { day: "Tue", score: 85 },
      { day: "Wed", score: 91 },
      { day: "Thu", score: 92 },
      { day: "Fri", score: 88 },
      { day: "Sat", score: 79 },
      { day: "Sun", score: 84 }
    ],
    coachingInsights: [
      "Your core deep-work focus is 12% higher during early morning blocks.",
      "Most missed deadlines cluster on Fridays, indicating scheduling over-optimism mid-week.",
      "Habit compliance correlates perfectly with an 88% overall task velocity score."
    ]
  };

  // Recommendations
  const recommendations: AIRecommendation[] = [
    {
      recommendationId: "r-1",
      userId: "user-1",
      recommendationText: "Advisory: S3 partitions in the audit require 4 hours. Deep work space is limited. Protect your calendar immediately.",
      status: "unread",
      createdAt: today.toISOString(),
      actionType: "schedule",
      targetId: "t-1"
    },
    {
      recommendationId: "r-2",
      userId: "user-1",
      recommendationText: "Patch the OAuth hash leak before Dave's Retrospective retro block at 15:30. Zero-trust vulnerability warning.",
      status: "unread",
      createdAt: today.toISOString(),
      actionType: "focus",
      targetId: "t-2"
    }
  ];

  return {
    user: {
      userId: "user-1",
      name: "Alex Vance",
      email: "adityasalve433@gmail.com",
      role: "entrepreneur",
      createdAt: today.toISOString(),
      aiProfileText: "Alex is an Entrepreneur running an early-stage AI automation startup. High-speed delivery, investor milestones, and infrastructure robustness are core priorities."
    },
    tasks,
    goals,
    milestones,
    habits,
    calendarEvents,
    analytics,
    recommendations,
    isOnboarded: true,
    googleCalendarConnected: true
  };
};

export const getAppState = (): AppState => {
  let data = localStorage.getItem(NEW_LOCAL_STORAGE_KEY);
  if (!data) {
    // Attempt fallback from old key
    const oldData = localStorage.getItem(OLD_LOCAL_STORAGE_KEY);
    if (oldData) {
      data = oldData;
      // Migrate to new key
      localStorage.setItem(NEW_LOCAL_STORAGE_KEY, oldData);
      localStorage.removeItem(OLD_LOCAL_STORAGE_KEY);
    }
  }

  if (!data) {
    const initialState = defaultState();
    localStorage.setItem(NEW_LOCAL_STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    const initialState = defaultState();
    localStorage.setItem(NEW_LOCAL_STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }
};

export const saveAppState = (state: AppState) => {
  localStorage.setItem(NEW_LOCAL_STORAGE_KEY, JSON.stringify(state));
};
