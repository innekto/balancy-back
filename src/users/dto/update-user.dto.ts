import { PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

import { userNameRegex } from '@/common/regex-patterns';

import { AccentColor, Language, Theme } from '../../common/enum/user.enum';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @Matches(userNameRegex, { message: 'Incorrect format of user name' })
  username?: string;

  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @IsOptional()
  @IsBoolean()
  memeReaction?: boolean;

  @IsOptional()
  @IsEnum(AccentColor)
  accentColor?: AccentColor;

  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  @IsOptional()
  taskMinutes?: number;
}
