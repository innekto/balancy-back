import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { lowerCaseTransformer, noSpaces } from '@/common';
import { emailRegex, passwordRegex } from '@/common/regex-patterns';

export class ChangePasswordDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  token?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(passwordRegex, {
    message:
      'the password must contain one capital letter, one digit and one special character',
  })
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Transform(lowerCaseTransformer)
  @noSpaces({ message: 'The email address cannot contain spaces' })
  @Matches(emailRegex, { message: 'Incorrect email format' })
  email?: string;
}
