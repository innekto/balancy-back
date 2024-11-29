import { BadRequestException } from '@nestjs/common';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

export const getDateRange = (period: string, currentDate: Date) => {
  let startDate: Date, endDate: Date;
  switch (period) {
    case 'day':
      startDate = startOfDay(currentDate);
      endDate = endOfDay(currentDate);
      break;
    case 'week':
      startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
      endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      break;
    case 'month':
      startDate = startOfMonth(currentDate);
      endDate = endOfMonth(currentDate);
      break;
    default:
      throw new BadRequestException('Invalid period provided');
  }
  return { startDate, endDate };
};
