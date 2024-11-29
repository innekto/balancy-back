import { ConflictException } from '@nestjs/common';

import { Type } from '@/common';
import { CreateTaskDto } from '@/tasks/dto/create-task.dto';

export const handleTaskCreationErrors = (payload: CreateTaskDto) => {
  if (payload.type === Type.Task && payload.geolocation) {
    throw new ConflictException('Task cannot have geolocation');
  }

  if (payload.type === Type.Event && payload.deadline) {
    throw new ConflictException('Event cannot have deadline date');
  }

  if (payload.type === Type.Event && payload.subTasks) {
    throw new ConflictException('Event cannot have subtasks');
  }
};
