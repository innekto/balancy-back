import {
  addDays,
  format,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
} from 'date-fns';

import { convertToLocalTime, formatToHoursMinutesSeconds } from '.';

export const datesForEventReminder = (
  offset: number,
  eventStartDate: string,
  isSendReminder?: boolean,
) => {
  const localStartDate = convertToLocalTime(eventStartDate, offset);

  if (!isSendReminder) {
    const now = new Date().toISOString();
    const localTime = formatToHoursMinutesSeconds(
      convertToLocalTime(now, offset),
    );

    const twentyOne = format(
      setMilliseconds(setSeconds(setMinutes(setHours(localTime, 21), 0), 0), 0),
      'yyyy-MM-dd HH:mm:ss',
    );

    const nextDayStart = format(
      setMilliseconds(
        setSeconds(setMinutes(setHours(addDays(localTime, 1), 0), 0), 0),
        0,
      ),
      'yyyy-MM-dd HH:mm:ss',
    );
    return { localTime, twentyOne, localStartDate, nextDayStart };
  }
  return { localStartDate };
};
