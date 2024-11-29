import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CloudinaryService } from '@/cloudinary/cloudinary.service';

import { TaskImage } from './entities/task-image.entity';
import { TaskImagesService } from './task-images.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaskImage])],
  providers: [TaskImagesService, CloudinaryService],
})
export class TaskImagesModule {}
