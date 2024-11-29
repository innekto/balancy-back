import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import {
  description,
  Priority,
  TaskCategories,
  Type as TaskType,
} from '@/common';
import { IsValidDate } from '@/common/helpers/task-utils/decorators/is-valid-date';
import { taskTitleRegex } from '@/common/regex-patterns';
import {
  lowerCaseArrayTransformer,
  lowerCaseTransformer,
} from '@/common/transformers/lower-case.transformer';
import { CreateLinkDto } from '@/links/dto/create-link.dto';
import { CreateSubTaskDto } from '@/sub-tasks/dto/create-sub-task.dto';
import { CreateTaskRemindDto } from '@/task-remind/dto/create-task-remind.dto';

export class CreateTaskDto {
  @ApiProperty({ type: 'string', format: 'binary', isArray: true })
  @IsOptional()
  @ArrayMaxSize(5, { message: 'You can upload up to 5 images' })
  images?: Express.Multer.File[];

  @IsNotEmpty()
  @Matches(taskTitleRegex, { message: 'incorrect format of title' })
  @MinLength(2)
  @MaxLength(200)
  @Transform(lowerCaseTransformer)
  readonly title: string;

  @IsNotEmpty()
  @Matches(taskTitleRegex, { message: 'incorrect format of description' })
  @MinLength(2)
  @MaxLength(2000)
  readonly description: string;

  @IsNotEmpty()
  @IsEnum(TaskCategories)
  readonly category: TaskCategories;

  @IsNotEmpty()
  @IsEnum(TaskType)
  readonly type: TaskType;

  @IsNotEmpty()
  @IsOptional()
  @IsEnum(Priority)
  readonly priority?: Priority;

  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  pinned: boolean;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  geolocation?: string;

  @ApiProperty({
    example: ['tag', 'name'],
  })
  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  @ArrayMaxSize(10)
  @Transform(lowerCaseArrayTransformer, { toClassOnly: true })
  @MinLength(2, { each: true })
  @MaxLength(30, { each: true })
  @Matches(/^[A-Za-zА-Яа-я_\s]*$/, {
    each: true,
    message: 'Incorrect format',
  })
  tagsName?: Array<string>;

  @ValidateNested()
  @ApiProperty({ type: [CreateLinkDto] })
  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  @Type(() => CreateLinkDto)
  links?: CreateLinkDto[];

  @ValidateNested()
  @ApiProperty({ type: [CreateSubTaskDto] })
  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  @Type(() => CreateSubTaskDto)
  subTasks?: CreateSubTaskDto[];

  @ValidateNested()
  @ApiProperty({ type: [CreateTaskRemindDto] })
  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  @Type(() => CreateTaskRemindDto)
  reminds?: CreateTaskRemindDto[];

  @ApiProperty({ example: '2024-05-29T17:27:11.797Z', description })
  @IsValidDate()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2024-05-29T17:27:11.797Z', description })
  @IsValidDate()
  @IsNotEmpty()
  @IsOptional()
  deadline?: string;
}
