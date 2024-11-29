import {
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
  startOfDay,
} from 'date-fns';

export const dayInts = (inetvalDates: string[]) => {
  const intervals = inetvalDates.map((day) => {
    const startOfDayDate = startOfDay(new Date(day));

    const firstInt = {
      start: setMilliseconds(
        setSeconds(setMinutes(setHours(startOfDayDate, 0), 0), 0),
        0,
      ),
      end: setMilliseconds(
        setSeconds(setMinutes(setHours(startOfDayDate, 6), 0), 0),
        -1,
      ),
    };

    const secondInt = {
      start: setMilliseconds(
        setSeconds(setMinutes(setHours(startOfDayDate, 6), 0), 0),
        0,
      ),
      end: setMilliseconds(
        setSeconds(setMinutes(setHours(startOfDayDate, 12), 0), 0),
        -1,
      ),
    };

    const thirdInt = {
      start: setMilliseconds(
        setSeconds(setMinutes(setHours(startOfDayDate, 12), 0), 0),
        0,
      ),
      end: setMilliseconds(
        setSeconds(setMinutes(setHours(startOfDayDate, 18), 0), 0),
        -1,
      ),
    };

    const fourthInt = {
      start: setMilliseconds(
        setSeconds(setMinutes(setHours(startOfDayDate, 18), 0), 0),
        0,
      ),
      end: setMilliseconds(
        setSeconds(setMinutes(setHours(startOfDayDate, 23), 59), 59),
        999,
      ),
    };

    return {
      firstInt,
      secondInt,
      thirdInt,
      fourthInt,
    };
  });
  return intervals;
};
