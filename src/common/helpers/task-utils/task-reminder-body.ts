import {
  convertToLocalTime,
  formatToHoursAndMinutes,
  subNormalizer,
} from '@/common';
import { Subscription } from '@/subscription/entities/subscription.entity';

export const taskReminderBody = (
  subscriptions: Subscription[],
  deadline: string,
  taskTitle: string,
  offset: number,
) => {
  const subs = subNormalizer(subscriptions);
  const localDeadline = convertToLocalTime(deadline, offset);

  const payload = JSON.stringify({
    title: 'Task deadline',
    body: `Deadline for ${taskTitle} is ${formatToHoursAndMinutes(
      localDeadline,
    )}`,
  });

  return { subs, payload };
};
