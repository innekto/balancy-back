import { PartialType } from '@nestjs/swagger';

import { CreateTaskRemindDto } from './create-task-remind.dto';

export class UpdateTaskRemindDto extends PartialType(CreateTaskRemindDto) {}
