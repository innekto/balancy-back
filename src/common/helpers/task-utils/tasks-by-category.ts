import { TaskCategories } from '@/common';
import { TaskEntity } from '@/tasks/entities/task.entity';

export const tasksByByCategory = (data: TaskEntity[]) => {
  return data.reduce(
    (counts, task) => {
      switch (task.category) {
        case TaskCategories.Work:
          counts.work++;
          break;
        case TaskCategories.Life:
          counts.life++;
          break;
        case TaskCategories.Learning:
          counts.learning++;
          break;
      }
      return counts;
    },
    { work: 0, life: 0, learning: 0 },
  );
};
