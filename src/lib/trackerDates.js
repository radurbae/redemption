import { startOfDay, startOfMonth, isBefore } from 'date-fns';

export const getHabitStartDate = (habit, currentMonth) => {
  const monthStart = startOfDay(startOfMonth(currentMonth));
  if (!habit || !habit.created_at) return monthStart;
  const createdAt = startOfDay(new Date(habit.created_at));
  return isBefore(createdAt, monthStart) ? monthStart : createdAt;
};

export const getEligibleDays = (days, habitStartDate) =>
  days.filter((date) => !isBefore(date, habitStartDate));
