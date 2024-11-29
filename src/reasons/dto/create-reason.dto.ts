import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { description, Reasons } from '@/common';
import { IsValidDate } from '@/common/helpers/task-utils/decorators/is-valid-date';

export class CreateReasonDto {
  @ApiProperty({ example: Reasons.Laziness })
  @IsNotEmpty()
  @IsEnum(Reasons)
  reason: Reasons;

  @ApiProperty({ example: '2024-05-29T17:27:11.797Z', description })
  @IsNotEmpty()
  @IsValidDate()
  newTaskDeadline: string;
}
