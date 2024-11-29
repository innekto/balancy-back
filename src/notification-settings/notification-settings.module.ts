import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TutorialLink } from '@/tutorial-links/entities/tutorial-link.entity';
import { TutorialLinksService } from '@/tutorial-links/tutorial-links.service';
import { UserEntity } from '@/users/entities/user.entity';

import { NotificationSettings } from './entities/notification-settings.entity';
import { NotificationSettingsController } from './notification-settings.controller';
import { NotificationSettingsService } from './notification-settings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationSettings, UserEntity, TutorialLink]),
  ],

  controllers: [NotificationSettingsController],
  providers: [NotificationSettingsService, TutorialLinksService],
  exports: [NotificationSettingsService],
})
export class NotificationSettingsModule {}
