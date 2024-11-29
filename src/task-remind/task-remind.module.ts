import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaskSchedulerService } from '@/schedule-job/task-schedule-job.service';
import { TasksModule } from '@/tasks/tasks.module';
import { TutorialLink } from '@/tutorial-links/entities/tutorial-link.entity';
import { TutorialLinksService } from '@/tutorial-links/tutorial-links.service';
import { UserEntity } from '@/users/entities/user.entity';
import { UsersModule } from '@/users/users.module';
import { WebPushService } from '@/web-push/web-push.service';

import { TaskRemind } from './entities/task-remind.entity';
import { TaskRemindController } from './task-remind.controller';
import { TaskRemindService } from './task-remind.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskRemind, TutorialLink, UserEntity]),
    TasksModule,
    UsersModule,
  ],
  controllers: [TaskRemindController],
  providers: [
    TaskRemindService,
    TaskSchedulerService,
    WebPushService,
    TutorialLinksService,
  ],
})
export class TaskRemindModule {}
