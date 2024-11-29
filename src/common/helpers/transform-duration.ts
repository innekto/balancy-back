import { intervalToDuration } from 'date-fns';

//for future
export const transformDuration = (ms: number): string => {
  const duration = intervalToDuration({ start: 0, end: ms });

  const formattedHours = duration.hours?.toString().padStart(2, '0') || '00';
  const formattedMinutes =
    duration.minutes?.toString().padStart(2, '0') || '00';
  const formattedSeconds =
    duration.seconds?.toString().padStart(2, '0') || '00';

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};
