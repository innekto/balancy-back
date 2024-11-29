import { differenceInDays } from 'date-fns';

import { convertToLocalTime } from './convert-utc-to-local';

export const getDifferenceInDays = (
  deadline: string,
  startDate: string,
  offset: number,
) => {
  const localStartDate = convertToLocalTime(startDate, offset);
  const localDeadline = convertToLocalTime(deadline, offset);

  localStartDate.setUTCHours(0, 0, 0, 0);
  localDeadline.setUTCHours(0, 0, 0, 0);

  return differenceInDays(localDeadline, localStartDate);
};
