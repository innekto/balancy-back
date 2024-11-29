import { TaskEntity } from '@/tasks/entities/task.entity';

import { dayInts } from './day-intervals';

export const tasksOnIntervals = (tasks: TaskEntity[], interval: string[]) => {
  const intervals = dayInts(interval);

  const tasksOnIntervals = intervals.map((i) => {
    const tasksInFirstInterval = tasks.filter((task) =>
      isTaskInInterval(task, i.firstInt),
    );

    const tasksInSecondInterval = tasks.filter((task) =>
      isTaskInInterval(task, i.secondInt),
    );

    const tasksInThirdInterval = tasks.filter((task) =>
      isTaskInInterval(task, i.thirdInt),
    );

    const tasksInFourthInterval = tasks.filter((task) =>
      isTaskInInterval(task, i.fourthInt),
    );

    return {
      tasksOnFirstInterval: tasksInFirstInterval,
      tasksOnSecondInterval: tasksInSecondInterval,
      tasksOnThirdInterval: tasksInThirdInterval,
      tasksOnFourthInterval: tasksInFourthInterval,
    };
  });

  return tasksOnIntervals;
};

const isTaskInInterval = (
  task: TaskEntity,
  interval: { start: Date; end: Date },
) => {
  const taskDate = new Date(task.completeDate);
  return taskDate >= interval.start && taskDate <= interval.end;
};
