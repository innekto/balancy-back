import { ITasksOnIntervals, tasksByByCategory } from '@/common';

export const groupIntervals = (data: ITasksOnIntervals[]) => {
  const intervals = {
    first: [],
    second: [],
    third: [],
    fourth: [],
  };

  data.forEach((interval) => {
    intervals.first.push(...interval.tasksOnFirstInterval);
    intervals.second.push(...interval.tasksOnSecondInterval);
    intervals.third.push(...interval.tasksOnThirdInterval);
    intervals.fourth.push(...interval.tasksOnFourthInterval);
  });

  return {
    firstByCat: tasksByByCategory(intervals.first),
    secondByCat: tasksByByCategory(intervals.second),
    thirdByCat: tasksByByCategory(intervals.third),
    fourthByCat: tasksByByCategory(intervals.fourth),
  };
};
