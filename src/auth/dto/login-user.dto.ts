import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';

import { lowerCaseTransformer, noSpaces } from '@/common';
import { emailRegex } from '@/common/regex-patterns';

export class LoginUserDto {
  @ApiProperty({ example: 'example@ex.com' })
  @Transform(lowerCaseTransformer)
  @noSpaces({ message: 'The email address cannot contain spaces' })
  @Matches(emailRegex, { message: 'Incorrect email format' })
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  password: string;
}
