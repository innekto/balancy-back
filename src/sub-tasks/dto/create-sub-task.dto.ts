import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';

import { taskTitleRegex } from '@/common/regex-patterns';

export class CreateSubTaskDto {
  @ApiProperty()
  @IsNotEmpty()
  @Matches(taskTitleRegex, { message: 'incorrect format of title' })
  @MinLength(2)
  @MaxLength(200)
  readonly title: string;
}
