import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

import { Priority, TaskCategories, Type } from '@/common';

export class UpdateTaskDto {
  @IsNotEmpty()
  @IsOptional()
  readonly title?: string;

  @IsNotEmpty()
  @IsOptional()
  readonly description?: string;

  @IsNotEmpty()
  @IsEnum(TaskCategories)
  @IsOptional()
  readonly category?: TaskCategories;

  @IsNotEmpty()
  @IsEnum(Type)
  @IsOptional()
  readonly type?: Type;

  @IsNotEmpty()
  @IsOptional()
  @IsEnum(Priority)
  readonly priority?: Priority;

  @IsNotEmpty()
  @IsOptional()
  pinned?: boolean;

  @IsNotEmpty()
  @IsOptional()
  readonly duration?: number;

  @IsNotEmpty()
  @IsOptional()
  geolocation?: string;
}
