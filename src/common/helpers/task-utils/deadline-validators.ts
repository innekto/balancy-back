import { BadRequestException } from '@nestjs/common';

import { deadlineMessageOne, deadlineMessageTwo } from '@/common/messages';
import { CreateSubTaskDto } from '@/sub-tasks/dto/create-sub-task.dto';

// const subTaskDeadlineValidator = (
//   subTasks: Array<CreateSubTaskDto> | CreateSubTaskDto,
//   taskDeadline: string,
// ) => {
//   if (Array.isArray(subTasks)) {
//     if (subTasks.some((sub) => sub.deadline > taskDeadline)) {
//       throw new BadRequestException(deadlineMessageOne);
//     }
//     if (subTasks.some((sub) => sub.deadline < sub.startDate)) {
//       throw new BadRequestException(deadlineMessageTwo);
//     }
//   } else if (subTasks.deadline > taskDeadline) {
//     throw new BadRequestException(deadlineMessageOne);
//   }
// };

const isDeadlineAfterStartDate = (startDate: string, deadline: string) => {
  if (deadline <= startDate) throw new BadRequestException(deadlineMessageTwo);
};

export {
  isDeadlineAfterStartDate,
  //  subTaskDeadlineValidator
};
