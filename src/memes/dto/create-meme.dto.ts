import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { MemCategory } from '../../common/enum/meme.enum';

export class CreateMemeDto {
  @ApiProperty({ example: 'Name', description: 'name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  imagePath: Express.Multer.File;

  @IsNotEmpty()
  @IsEnum(MemCategory)
  category: MemCategory;
}
