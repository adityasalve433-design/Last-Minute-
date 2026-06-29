/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Task } from "../types";
import { scoreTaskWithAI } from "../lib/gemini";

interface TaskManagerProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskManager({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask
}: TaskManagerProps) {
  const [filter, setFilter] = useState<"all" | "todo" | "in_progress" | "completed">("all");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  
  // Form fields
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [isScoring, setIsScoring] = useState<boolean>(false);

  // Active subtask editor
  const [activeTaskDetailId, setActiveTaskDetailId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline) return;

    setIsScoring(true);
    try {
      // Score task using the backend Gemini endpoint
      const aiMetrics = await scoreTaskWithAI(title, description, deadline);
      
      const newTask: Task = {
        taskId: `t-${Date.now()}`,
        userId: "user-1",
        title,
        description,
        deadline,
        priorityScore: aiMetrics.priorityScore,
        riskScore: aiMetrics.riskScore,
        estimatedEffort: aiMetrics.estimatedEffort,
        status: "todo",
        createdAt: new Date().toISOString(),
        tags: aiMetrics.tags,
        subtasks: aiMetrics.subtasks || [
          { title: "Review requirements", completed: false },
          { title: "Draft implementation design", completed: false }
        ],
        aiActionAdvice: aiMetrics.aiActionAdvice
      };

      onAddTask(newTask);
      
      // Reset form
      setTitle("");
      setDescription("");
      setDeadline("");
      setShowAddForm(false);
    } catch (err) {
      console.error("AI scoring failed, appending default metrics:", err);
    } finally {
      setIsScoring(false);
    }
  };

  const toggleSubtask = (task: Task, subtaskIdx: number) => {
    if (!task.subtasks) return;
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIdx] = {
      ...updatedSubtasks[subtaskIdx],
      completed: !updatedSubtasks[subtaskIdx].completed
    };
    
    // Auto complete task if all subtasks are finished (optional helper)
    const updated: Task = {
      ...task,
      subtasks: updatedSubtasks
    };
    onUpdateTask(updated);
  };

  const updateStatus = (task: Task, newStatus: "todo" | "in_progress" | "completed") => {
    const updated: Task = { ...task, status: newStatus };
    onUpdateTask(updated);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header section with Add Button */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-black text-white tracking-tighter uppercase">
            Trajectory Manager
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Create, track, and let Gemini auto-evaluate execution risk.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/20 active:scale-95 transition-all flex items-center gap-1.5 uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Task
        </button>
      </div>

      {/* Dynamic Add Form Modal/Collapse */}
      {showAddForm && (
        <div className="glass-panel p-6 rounded-3xl border-neutral-800 space-y-4">
          <h3 className="font-display text-sm font-black text-white uppercase tracking-widest">
            Register New Trajectory Block
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-500 mb-1.5 font-bold">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
                  placeholder="Finalize seed funding deck..."
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-500 mb-1.5 font-bold">
                  Target Deadline
                </label>
                <input
                  type="datetime-local"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-500 mb-1.5 font-bold">
                Description / Context
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 min-h-[80px] resize-none font-semibold"
                placeholder="Core benchmarks, blocked team members, etc."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isScoring}
                className="px-5 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-2 shadow-md hover:bg-orange-500 active:scale-95 transition-all uppercase tracking-wider"
              >
                {isScoring ? (
                  <>
                    <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin"></div>
                    Gemini Assessing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    Save Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtering Pills */}
      <div className="flex gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800 w-fit">
        {[
          { id: "all", label: "All" },
          { id: "todo", label: "To-Do" },
          { id: "in_progress", label: "In Progress" },
          { id: "completed", label: "Completed" }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id as any)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
              filter === btn.id
                ? "bg-orange-600/10 text-orange-400 border border-orange-500/20 shadow-sm"
                : "text-neutral-400 hover:text-white border border-transparent"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Trajectory Task Cards */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
              key={task.taskId}
              className={`glass-panel p-6 rounded-3xl transition-all border border-neutral-800 border-l-4 ${
                task.status === "completed"
                  ? "border-l-green-500/50"
                  : task.priorityScore >= 90
                  ? "border-l-red-500"
                  : "border-l-orange-500/60"
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      task.priorityScore >= 90
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-orange-600/10 text-orange-400 border border-orange-500/20"
                    }`}>
                      SCORE {task.priorityScore}
                    </span>
                    <span className="font-mono text-[9px] text-neutral-500 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800/40 font-bold">
                      Effort: {task.estimatedEffort}h
                    </span>
                    <span className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded ${
                      task.riskScore >= 80 ? "text-red-400 font-bold" : "text-neutral-500 font-bold"
                    }`}>
                      {task.riskScore >= 80 ? "⚠️ Critical Risk" : "Stable"}
                    </span>
                  </div>

                  <h3 className={`font-display text-base font-black text-white uppercase tracking-tight ${task.status === "completed" && "line-through opacity-50"}`}>
                    {task.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                    {task.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Status update buttons */}
                  {task.status !== "todo" && (
                    <button
                      onClick={() => updateStatus(task, "todo")}
                      className="p-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-[10px] uppercase font-mono text-neutral-400 hover:text-white font-bold"
                      title="Mark To-Do"
                    >
                      To-Do
                    </button>
                  )}
                  {task.status !== "in_progress" && (
                    <button
                      onClick={() => updateStatus(task, "in_progress")}
                      className="p-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-[10px] uppercase font-mono text-orange-400 hover:bg-orange-600/10 font-bold"
                      title="Mark In Progress"
                    >
                      Work
                    </button>
                  )}
                  {task.status !== "completed" && (
                    <button
                      onClick={() => updateStatus(task, "completed")}
                      className="p-1.5 bg-green-500/10 rounded-lg text-[10px] uppercase font-mono text-green-400 hover:bg-green-500/20 font-bold"
                      title="Complete"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteTask(task.taskId)}
                    className="p-1.5 hover:bg-red-500/10 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>

              {/* Toggle detailed breakdown area */}
              <div className="mt-4 pt-4 border-t border-neutral-800 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setActiveTaskDetailId(activeTaskDetailId === task.taskId ? null : task.taskId)}
                    className="text-xs font-mono text-orange-500 hover:underline flex items-center gap-1 font-bold uppercase tracking-wider"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {activeTaskDetailId === task.taskId ? "expand_less" : "expand_more"}
                    </span>
                    {activeTaskDetailId === task.taskId ? "Hide AI Breakdown" : "View AI Breakdown & Subtasks"}
                  </button>
                  <p className="font-mono text-[9px] text-neutral-500 font-bold">
                    DUE: {new Date(task.deadline).toLocaleString()}
                  </p>
                </div>

                {activeTaskDetailId === task.taskId && (
                  <div className="space-y-4 pt-1 animate-pulse-soft">
                    {/* AI Coach Action Advice */}
                    {task.aiActionAdvice && (
                      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
                        <span className="font-bold text-orange-500 mr-1 flex items-center gap-1 mb-1.5 uppercase tracking-wide">
                          <span className="material-symbols-outlined text-xs">auto_awesome</span>
                          Omni Mind Action Brief:
                        </span>
                        {task.aiActionAdvice}
                      </div>
                    )}

                    {/* Subtask Checklists */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-mono text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                          Structured Execution Path
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {task.subtasks.map((sub, sIdx) => (
                            <label
                              key={sIdx}
                              className="flex items-center gap-2.5 p-2 bg-neutral-950 border border-neutral-800/50 hover:bg-neutral-900/50 rounded-lg cursor-pointer text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={sub.completed}
                                onChange={() => toggleSubtask(task, sIdx)}
                                className="rounded border-neutral-800 bg-neutral-950 text-orange-600 focus:ring-orange-500"
                              />
                              <span className={`text-white font-sans ${sub.completed && "line-through opacity-50 font-semibold"}`}>
                                {sub.title}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 glass-panel rounded-3xl border-neutral-800 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-orange-500 text-4xl mb-3 animate-pulse">
              inbox
            </span>
            <h4 className="font-display font-black text-white text-base uppercase tracking-wider">No trajectory blocks match filter</h4>
            <p className="text-xs text-neutral-500 mt-1 font-bold">
              Add a new task or try shifting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
