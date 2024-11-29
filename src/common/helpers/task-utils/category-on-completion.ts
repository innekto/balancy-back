import { ConflictException } from '@nestjs/common';

import { isValidCategory, TaskCategories } from '@/common';
import { TaskEntity } from '@/tasks/entities/task.entity';

export const categoryOnCompletion = (
  tasks: TaskEntity[],
  rescheduledTasks: TaskEntity[],
  completedTasks: TaskEntity[],
  failedTasks: TaskEntity[],
  category: TaskCategories,
) => {
  if (!isValidCategory(category)) {
    throw new ConflictException('No such category exists');
  }

  const counts = {
    tasks: 0,
    rescheduledTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
  };

  const rescheduledTasksSet = new Set(rescheduledTasks.map((task) => task.id));
  const completedTasksSet = new Set(completedTasks.map((task) => task.id));
  const failedTasksSet = new Set(failedTasks.map((task) => task.id));

  tasks.forEach((task) => {
    if (task.category === category) {
      counts.tasks += 1;

      switch (true) {
        case rescheduledTasksSet.has(task.id):
          counts.rescheduledTasks += 1;
          break;
        case completedTasksSet.has(task.id):
          counts.completedTasks += 1;
          break;
        case failedTasksSet.has(task.id):
          counts.failedTasks += 1;
          break;
        default:
          break;
      }
    }
  });

  return counts;
};
