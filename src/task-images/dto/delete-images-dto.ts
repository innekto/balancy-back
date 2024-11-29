import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

export class DeleteImagesDto {
  @ApiProperty({
    description: 'Array of image IDs to delete',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  imageIds?: number[];
}
