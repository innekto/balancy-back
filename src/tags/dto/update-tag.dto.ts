import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateTagDto {
  @IsString()
  @MinLength(3)
  @ApiProperty()
  readonly name: string;
}
