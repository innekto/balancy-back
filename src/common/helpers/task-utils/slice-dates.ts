import { convertToLocalTime } from '.';

export const formatToHoursAndMinutes = (date: Date) => {
  return date
    ? date.toISOString().slice(0, 19).replace('T', ' ').slice(0, -3)
    : null;
};

export const formatToHoursMinutesSeconds = (date: Date) => {
  return date ? date.toISOString().slice(0, 19).replace('T', ' ') : null;
};

export const message = (
  offset: number,
  taskDeadline?: string,
  startDate?: string,
) => {
  const localDeadline = taskDeadline
    ? convertToLocalTime(taskDeadline, offset)
    : null;

  const localStartDate = startDate
    ? convertToLocalTime(startDate, offset)
    : null;

  const message = localDeadline
    ? `task deadline is ${formatToHoursAndMinutes(localDeadline)} `
    : `event is coming up at ${formatToHoursAndMinutes(localStartDate)}`;

  return message;
};
