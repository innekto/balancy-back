import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class LoginUserResponseDto {
  @IsJWT()
  @ApiProperty()
  accessToken: string;
}
