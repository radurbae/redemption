'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AppShell from '@/components/AppShell';
import { useToast } from '@/components/Toast';
import { Plus, Check, Trash2, Sparkles, ListTodo, Clock, ChevronDown, ChevronRight, Bell } from 'lucide-react';
import type { Task } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/dates';
import { levelFromXp } from '@/lib/utils/rewards';

const TASK_XP = 5; // XP per task completion
const TASK_GOLD = 3; // Gold per task completion
const REMINDER_MINUTES = 15; // Minutes before task to remind

// Format time for display (24h to 12h)
function formatTime(time: string | null): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// Request notification permission
async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Schedule a notification
function scheduleNotification(task: Task) {
  if (!task.scheduled_time || !('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  const [hours, minutes] = task.scheduled_time.split(':').map(Number);
  const now = new Date();
  const taskTime = new Date();
  taskTime.setHours(hours, minutes, 0, 0);

  // Time to notify (15 min before)
  const notifyTime = new Date(taskTime.getTime() - REMINDER_MINUTES * 60 * 1000);
  const delay = notifyTime.getTime() - now.getTime();

  // Only schedule if it's in the future
  if (delay > 0) {
    return setTimeout(() => {
      new Notification('⏰ Task Reminder', {
        body: `"${task.title}" is coming up in ${REMINDER_MINUTES} minutes!`,
        icon: '/icons/icon-192x192.png',
        tag: task.id,
      });
    }, delay);
  }

  return null;
}

export default function ToDoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const { showToast } = useToast();
  const today = formatDate(new Date());

  // Check notification permission on mount
  useEffect(() => {
    setIsMounted(true);
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Schedule notifications for tasks with time
  useEffect(() => {
    // Clear old timers
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current.clear();

    // Schedule new ones
    if (notificationsEnabled) {
      tasks.forEach(task => {
        if (!task.completed && task.scheduled_time) {
          const timer = scheduleNotification(task);
          if (timer) {
            timersRef.current.set(task.id, timer);
          }
        }
      });
    }

    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, [tasks, notificationsEnabled]);

  const fetchTasks = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('scheduled_time', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    setTasks(data || []);
    setIsLoading(false);
  }, [today]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      // Send a test notification immediately
      new Notification('✅ Notifications Enabled!', {
        body: 'You\'ll get reminders 15 minutes before scheduled tasks.',
        icon: '/icons/icon-192x192.png',
      });
      showToast('Notifications enabled! Test notification sent.', 'success');
    } else {
      showToast('Notifications were denied. Enable them in browser settings.', 'error');
    }
  };

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
        scheduled_time: newTaskTime || null,
      })
      .select()
      .single();

    if (data && !error) {
      setTasks(prev => {
        const updated = [...prev, data];
        // Sort by time (nulls last), then by created_at
        return updated.sort((a, b) => {
          if (!a.scheduled_time && !b.scheduled_time) return 0;
          if (!a.scheduled_time) return 1;
          if (!b.scheduled_time) return -1;
          return a.scheduled_time.localeCompare(b.scheduled_time);
        });
      });
      setNewTaskTitle('');
      setNewTaskTime('');
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
      // Clear any scheduled notification
      const timer = timersRef.current.get(task.id);
      if (timer) {
        clearTimeout(timer);
        timersRef.current.delete(task.id);
      }

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
          habit_id: task.id,
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

    // Clear notification timer
    const timer = timersRef.current.get(taskId);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(taskId);
    }

    setTasks(prev => prev.filter(t => t.id !== taskId));

    await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
  };

  // Separate ongoing and done tasks
  const ongoingTasks = tasks.filter(t => !t.completed);
  const doneTasks = tasks.filter(t => t.completed);
  const completedCount = doneTasks.length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const TaskItem = ({ task }: { task: Task }) => (
    <div
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

      {/* Title + Time */}
      <div className="flex-1 min-w-0">
        <span
          className="block truncate"
          style={{
            color: task.completed ? 'var(--foreground-muted)' : 'var(--foreground)',
            textDecoration: task.completed ? 'line-through' : undefined,
          }}
        >
          {task.title}
        </span>
        {task.scheduled_time && (
          <span
            className="flex items-center gap-1 text-xs mt-0.5"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <Clock className="w-3 h-3" />
            {formatTime(task.scheduled_time)}
            {notificationsEnabled && !task.completed && (
              <Bell className="w-3 h-3 ml-1 text-indigo-500" />
            )}
          </span>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={() => handleDeleteTask(task.id)}
        className="w-8 h-8 rounded-lg flex items-center justify-center hover:text-red-500 hover:bg-red-500/10 transition-colors"
        style={{ color: 'var(--foreground-muted)' }}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

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
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }} suppressHydrationWarning>
          {isMounted ? new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          }) : '\u00A0'}
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

      {/* Notification Permission Banner */}
      {isMounted && !notificationsEnabled && 'Notification' in window && (
        <button
          onClick={handleEnableNotifications}
          className="w-full card p-4 mb-6 flex items-center gap-3 hover:border-indigo-500/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
              Enable Reminders
            </p>
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
              Get notified 15 minutes before scheduled tasks
            </p>
          </div>
        </button>
      )}

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="mb-6">
        <div className="flex gap-2 mb-2">
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
        {/* Time picker row */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: 'var(--foreground-muted)' }} />
            <input
              type="time"
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-indigo-500"
              style={{
                background: 'var(--background-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            />
            {newTaskTime && (
              <button
                type="button"
                onClick={() => setNewTaskTime('')}
                className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-red-500"
              >
                Clear
              </button>
            )}
          </div>
          <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            {newTaskTime ? `Scheduled for ${formatTime(newTaskTime)}` : 'No time set (optional)'}
          </span>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--foreground-muted)' }}>
          Each task gives +{TASK_XP} XP, +{TASK_GOLD} Gold
        </p>
      </form>

      {/* Ongoing Tasks */}
      <div className="space-y-2 mb-6">
        {isLoading ? (
          <>
            <div className="skeleton h-14 rounded-xl" />
            <div className="skeleton h-14 rounded-xl" />
            <div className="skeleton h-14 rounded-xl" />
          </>
        ) : ongoingTasks.length === 0 && doneTasks.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              No tasks yet
            </h2>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Add your first task to start earning rewards!
            </p>
          </div>
        ) : ongoingTasks.length === 0 ? (
          <div className="card p-6 text-center">
            <Sparkles className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              All caught up! 🎉
            </p>
          </div>
        ) : (
          ongoingTasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))
        )}
      </div>

      {/* Done Section (Collapsible) */}
      {doneTasks.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowDone(!showDone)}
            className="flex items-center gap-2 w-full py-2 text-left"
          >
            {showDone ? (
              <ChevronDown className="w-4 h-4" style={{ color: 'var(--foreground-muted)' }} />
            ) : (
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--foreground-muted)' }} />
            )}
            <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>
              Done ({doneTasks.length})
            </span>
          </button>

          {showDone && (
            <div className="space-y-2 mt-2">
              {doneTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
