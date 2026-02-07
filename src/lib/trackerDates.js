import { format, startOfMonth } from 'date-fns';

const toDateString = (date) =>
  typeof date === 'string' ? date.slice(0, 10) : format(date, 'yyyy-MM-dd');

export const getHabitStartDateString = (habit, currentMonth) => {
  const monthStartStr = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  if (!habit || !habit.created_at) return monthStartStr;
  const createdAtStr = habit.created_at.slice(0, 10);
  return createdAtStr < monthStartStr ? monthStartStr : createdAtStr;
};

export const getHabitCreatedDateString = (habit) =>
  habit?.created_at ? format(new Date(habit.created_at), 'yyyy-MM-dd') : null;

export const isEligibleDay = (date, habitStartDateStr) =>
  format(date, 'yyyy-MM-dd') >= habitStartDateStr;

export const getEligibleDays = (days, habitStartDateStr) =>
  days.filter((date) => isEligibleDay(date, habitStartDateStr));

export const isOnOrAfterHabitCreated = (date, habit) => {
  const createdAtStr = getHabitCreatedDateString(habit);
  if (!createdAtStr) return true;
  return toDateString(date) >= createdAtStr;
};
