import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { TaskSchedulerService } from '@/schedule-job/task-schedule-job.service';
import { SubTaskEntity } from '@/sub-tasks/entities/sub-task.entity';
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

import { LinkEntity } from './entities/link.entity';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LinkEntity,
      TaskEntity,
      UserEntity,
      TagEntity,
      SubTaskEntity,
      TaskRemind,
      TutorialLink,
      TaskImage,
    ]),
  ],
  controllers: [LinksController],
  providers: [
    LinksService,
    TasksService,
    TaskSchedulerService,
    WebPushService,
    TagsService,
    TutorialLinksService,
    TaskImagesService,
    CloudinaryService,
  ],
})
export class LinksModule {}
