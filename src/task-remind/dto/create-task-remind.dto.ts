import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { description } from '@/common';
import { IsValidDate } from '@/common/helpers/task-utils/decorators/is-valid-date';

export class CreateTaskRemindDto {
  @ApiProperty({
    example: '2024-05-29T17:27:11.797Z',
    description,
  })
  @IsNotEmpty()
  @IsValidDate()
  remindDate: string;
}
