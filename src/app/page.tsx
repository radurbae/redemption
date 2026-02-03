'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AppShell from '@/components/AppShell';
import { useToast } from '@/components/Toast';
import { Plus, Check, Trash2, Sparkles, ListTodo } from 'lucide-react';
import type { Task } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/dates';
import { levelFromXp } from '@/lib/utils/rewards';

const TASK_XP = 5; // XP per task completion
const TASK_GOLD = 3; // Gold per task completion

export default function ToDoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const today = formatDate(new Date());

  const fetchTasks = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('created_at', { ascending: true });

    setTasks(data || []);
    setIsLoading(false);
  }, [today]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsAdding(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setIsAdding(false);
      return;
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: newTaskTitle.trim(),
        date: today,
      })
      .select()
      .single();

    if (data && !error) {
      setTasks(prev => [...prev, data]);
      setNewTaskTitle('');
      inputRef.current?.focus();
    }
    setIsAdding(false);
  };

  const handleToggleTask = async (task: Task) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const newCompleted = !task.completed;

    // Optimistic update
    setTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, completed: newCompleted } : t
    ));

    await supabase
      .from('tasks')
      .update({ completed: newCompleted })
      .eq('id', task.id);

    // Award XP/Gold on completion
    if (newCompleted) {
      const { data: profile } = await supabase
        .from('player_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const newXp = profile.xp + TASK_XP;
        const newGold = profile.gold + TASK_GOLD;
        const newLevel = levelFromXp(newXp);

        await supabase
          .from('player_profile')
          .update({ xp: newXp, gold: newGold, level: newLevel })
          .eq('user_id', user.id);

        await supabase.from('reward_ledger').insert({
          user_id: user.id,
          habit_id: task.id, // Use task id
          date: today,
          xp_delta: TASK_XP,
          gold_delta: TASK_GOLD,
          reason: 'task_complete',
        });

        showToast(`+${TASK_XP} XP, +${TASK_GOLD} Gold`, 'success');
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const supabase = createClient();

    setTasks(prev => prev.filter(t => t.id !== taskId));

    await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <ListTodo className="w-7 h-7 text-indigo-500" />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            To Do
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Progress */}
      {totalCount > 0 && (
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>
              Progress
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="xp-bar-container">
            <div
              className="xp-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {progressPercent === 100 && (
            <p className="text-green-500 text-xs mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              All tasks completed!
            </p>
          )}
        </div>
      )}

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="mb-6">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:border-indigo-500"
            style={{
              background: 'var(--background-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          />
          <button
            type="submit"
            disabled={isAdding || !newTaskTitle.trim()}
            className="px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--foreground-muted)' }}>
          Each task gives +{TASK_XP} XP, +{TASK_GOLD} Gold
        </p>
      </form>

      {/* Tasks List */}
      <div className="space-y-2">
        {isLoading ? (
          <>
            <div className="skeleton h-14 rounded-xl" />
            <div className="skeleton h-14 rounded-xl" />
            <div className="skeleton h-14 rounded-xl" />
          </>
        ) : tasks.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              No tasks yet
            </h2>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Add your first task to start earning rewards!
            </p>
          </div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all ${task.completed
                ? 'bg-green-500/10 border border-green-500/20'
                : 'border'
                }`}
              style={!task.completed ? {
                background: 'var(--background-secondary)',
                borderColor: 'var(--border)'
              } : undefined}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggleTask(task)}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all btn-press ${task.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'hover:border-indigo-500'
                  }`}
                style={!task.completed ? { borderColor: 'var(--border)' } : undefined}
              >
                {task.completed && <Check className="w-4 h-4" />}
              </button>

              {/* Title */}
              <span
                className="flex-1"
                style={{
                  color: task.completed ? 'var(--foreground-muted)' : 'var(--foreground)',
                  textDecoration: task.completed ? 'line-through' : undefined,
                }}
              >
                {task.title}
              </span>

              {/* Delete */}
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:text-red-500 hover:bg-red-500/10 transition-colors"
                style={{ color: 'var(--foreground-muted)' }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
