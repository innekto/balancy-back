import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { passwordRegex } from '@/common/regex-patterns';

export class GoogleLoginDto {
  @IsNotEmpty()
  @IsString()
  googleToken: string;

  @ApiProperty({ example: '182j2nsdk' })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  @Matches(passwordRegex, {
    message:
      'the password must contain one capital letter, one digit and one special character',
  })
  @MinLength(8)
  @MaxLength(20)
  password?: string;
}
