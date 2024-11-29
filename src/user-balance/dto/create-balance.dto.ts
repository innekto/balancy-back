import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateBalanceDto {
  @ApiProperty({ example: 10, description: 'Work balance' })
  @IsNotEmpty()
  readonly work: number;

  @ApiProperty({ example: 25, description: 'Life balance' })
  @IsNotEmpty()
  life: number;

  @ApiProperty({ example: 25, description: 'Learning balance' })
  @IsNotEmpty()
  learning: number;
}
