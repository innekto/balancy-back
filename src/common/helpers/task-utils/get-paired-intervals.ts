import { eachDayOfInterval, endOfMonth, startOfMonth } from 'date-fns';

import { convertToLocalTime } from './convert-utc-to-local';

export const getPairedIntervals = (date: string, offset: number) => {
  const localDate = convertToLocalTime(date, offset);

  const startDate = convertToLocalTime(
    startOfMonth(localDate).toISOString(),
    offset,
  );

  const endDate = convertToLocalTime(
    endOfMonth(localDate).toISOString(),
    offset,
  );

  const intervalDates = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const stringIntervals = intervalDates.map((i) => i.toISOString());

  //paired intervals in UTC
  const pairedIntervals = stringIntervals
    .map((date, index) => {
      if (index < stringIntervals.length - 1) {
        return [date, stringIntervals[index + 1]];
      }
    })
    .filter(Boolean);

  return pairedIntervals;
};
