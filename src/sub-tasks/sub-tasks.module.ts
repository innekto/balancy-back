import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { LinkEntity } from '@/links/entities/link.entity';
import { LinksService } from '@/links/links.service';
import { TaskSchedulerService } from '@/schedule-job/task-schedule-job.service';
import { TagEntity } from '@/tags/entities/tag.entity';
import { TagsService } from '@/tags/tags.service';
import { TaskImage } from '@/task-images/entities/task-image.entity';
import { TaskImagesService } from '@/task-images/task-images.service';
import { TaskRemind } from '@/task-remind/entities/task-remind.entity';
import { TaskEntity } from '@/tasks/entities/task.entity';
import { TasksService } from '@/tasks/tasks.service';
import { TutorialLink } from '@/tutorial-links/entities/tutorial-link.entity';
import { TutorialLinksService } from '@/tutorial-links/tutorial-links.service';
import { UserEntity } from '@/users/entities/user.entity';
import { WebPushService } from '@/web-push/web-push.service';

import { SubTaskEntity } from './entities/sub-task.entity';
import { SubTasksController } from './sub-tasks.controller';
import { SubTasksService } from './sub-tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubTaskEntity,
      TaskEntity,
      UserEntity,
      TagEntity,
      LinkEntity,
      TaskRemind,
      TutorialLink,
      TaskImage,
    ]),
  ],
  controllers: [SubTasksController],
  providers: [
    SubTasksService,
    TasksService,
    LinksService,
    TaskSchedulerService,
    WebPushService,
    TagsService,
    TutorialLinksService,
    TaskImagesService,
    CloudinaryService,
  ],
  exports: [TasksService],
})
export class SubTaskModule {}
