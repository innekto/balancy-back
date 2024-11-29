import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';

import { TagEntity } from '@/tags/entities/tag.entity';
import { TutorialLink } from '@/tutorial-links/entities/tutorial-link.entity';
import { TutorialLinksService } from '@/tutorial-links/tutorial-links.service';

import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity, UserEntity, TutorialLink])],
  controllers: [TagsController],
  providers: [TagsService, TutorialLinksService],
  exports: [TagsService],
})
export class TagsModule {}
