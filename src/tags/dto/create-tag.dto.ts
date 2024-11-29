import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { lowerCaseArrayTransformer } from '@/common/transformers/lower-case.transformer';

export class CreateTagDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @Transform(lowerCaseArrayTransformer, { toClassOnly: true })
  @MinLength(2, { each: true })
  @MaxLength(30, { each: true })
  @Matches(/^[A-Za-zА-Яа-я_\s]*$/, {
    each: true,
    message: 'Incorrect format',
  })
  @ApiProperty({ example: ['tag', 'tag'] })
  readonly names: string[];
}
