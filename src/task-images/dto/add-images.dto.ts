import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize } from 'class-validator';

export class AddImagesDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Array of images to be uploaded',
    required: true,
    isArray: true,
  })
  @ArrayMaxSize(5, { message: 'You can upload up to 5 images' })
  images: Express.Multer.File[];
}
