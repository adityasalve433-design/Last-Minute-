/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PersonaRole = "student" | "professional" | "entrepreneur";

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: PersonaRole;
  createdAt: string;
  aiProfileText?: string;
}

export interface Task {
  taskId: string;
  userId: string;
  title: string;
  description: string;
  deadline: string; // ISO string
  priorityScore: number; // 1-100
  riskScore: number; // 1-100
  estimatedEffort: number; // in hours or minutes
  status: "todo" | "in_progress" | "completed";
  createdAt: string;
  tags: string[];
  subtasks?: { title: string; completed: boolean }[];
  aiActionAdvice?: string;
}

export interface Goal {
  goalId: string;
  userId: string;
  title: string;
  progress: number; // 0-100
  targetDate: string; // ISO string
  category: "Academic" | "Career" | "Business" | "Personal";
  successProbability?: number; // 0-100 (AI calculated)
}

export interface Milestone {
  milestoneId: string;
  goalId: string;
  title: string;
  status: "pending" | "completed";
}

export interface Habit {
  habitId: string;
  userId: string;
  title: string;
  streak: number;
  completionRate: number; // percentage
  history: { [dateStr: string]: boolean }; // e.g. "2026-06-25": true
  category: "study" | "exercise" | "reading" | "sleep" | "general";
}

export interface CalendarEvent {
  eventId: string;
  userId: string;
  title: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  isSyncedFromGoogle?: boolean;
}

export interface ProductivityAnalytics {
  analyticsId: string;
  userId: string;
  productivityScore: number; // 0-100
  completionRate: number; // percentage
  focusTime: number; // hours
  missedDeadlines: number;
  weeklyTrends: { day: string; score: number }[];
  coachingInsights: string[];
}

export interface AIRecommendation {
  recommendationId: string;
  userId: string;
  recommendationText: string;
  status: "unread" | "dismissed" | "actioned";
  createdAt: string;
  actionType?: string;
  targetId?: string; // Links to task or goal
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string; payload?: any }[];
}
