import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Meme } from '../../../memes/entities/meme.entity';
import { AvatarMemeSeedService } from './avatar.meme.seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Meme])],
  providers: [AvatarMemeSeedService],
  exports: [AvatarMemeSeedService],
})
export class AvatarMemeSeedModule {}
