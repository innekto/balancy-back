import { TaskEntity } from '@/tasks/entities/task.entity';

export interface IntervalStatistics {
  intervals: {
    firstByCat: {
      work: number;
      life: number;
      learning: number;
    };
    secondByCat: {
      work: number;
      life: number;
      learning: number;
    };
    thirdByCat: {
      work: number;
      life: number;
      learning: number;
    };
    fourthByCat: {
      work: number;
      life: number;
      learning: number;
    };
  };
  pastTasks: number;
  futureTasks: number;
  totalCompletedTasks: number;
}

export interface ITasksOnIntervals {
  tasksOnFirstInterval: TaskEntity[];
  tasksOnSecondInterval: TaskEntity[];
  tasksOnThirdInterval: TaskEntity[];
  tasksOnFourthInterval: TaskEntity[];
}
