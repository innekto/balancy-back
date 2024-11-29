import { TaskCategories } from '..';

const isValidCategory = (category: string): category is TaskCategories =>
  Object.values(TaskCategories).includes(category as TaskCategories);

export { isValidCategory };
