import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaskEntity } from '@/tasks/entities/task.entity';
import { UserEntity } from '@/users/entities/user.entity';

import { TutorialLink } from './entities/tutorial-link.entity';
import { TutorialLinksService } from './tutorial-links.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, TutorialLink, TaskEntity])],
  providers: [TutorialLinksService],
  exports: [TutorialLinksService],
})
export class TutorialLinksModule {}
