export interface Habit {
  id: string;
  user_id: string;
  title: string;
  identity: string;
  obvious_cue: string | null;
  attractive_bundle: string | null;
  easy_step: string;
  satisfying_reward: string | null;
  schedule: 'daily' | 'weekdays';
  created_at: string;
}

export interface Checkin {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  status: 'done' | 'skipped';
  created_at: string;
}

export interface HabitWithCheckin extends Habit {
  todayCheckin: Checkin | null;
  yesterdayCheckin: Checkin | null;
  streak: number;
}

export interface HabitFormData {
  title: string;
  identity: string;
  obvious_cue: string;
  attractive_bundle: string;
  easy_step: string;
  satisfying_reward: string;
  schedule: 'daily' | 'weekdays';
}

export type CheckinStatus = 'done' | 'skipped' | null;

export interface TrackerDay {
  date: Date;
  status: CheckinStatus;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export interface HabitTemplate {
  title: string;
  identity: string;
  obvious_cue: string;
  attractive_bundle: string;
  easy_step: string;
  satisfying_reward: string;
  schedule: 'daily' | 'weekdays';
}
