import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CloudinaryService } from '@/cloudinary/cloudinary.service';

import { Meme } from './entities/meme.entity';
import { MemesController } from './memes.controller';
import { MemesService } from './memes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Meme])],
  controllers: [MemesController],
  providers: [MemesService, CloudinaryService],
})
export class MemesModule {}
