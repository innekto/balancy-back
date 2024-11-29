import { IsNotEmpty, IsString } from 'class-validator';

export class ResetCodeDto {
  @IsNotEmpty()
  @IsString()
  resetCode: string;
}
