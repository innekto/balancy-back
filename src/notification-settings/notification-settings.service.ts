import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, Repository } from 'typeorm';

import { TutorialLinkField } from '@/common';
import { TutorialLinksService } from '@/tutorial-links/tutorial-links.service';
import { UserEntity } from '@/users/entities/user.entity';

import { CreateNotificationSettingDto } from './dto/create-notification-settings.dto';
import { UpdateNotificationSettingDto } from './dto/update-notification-setting.dto';
import { NotificationSettings } from './entities/notification-settings.entity';

@Injectable()
export class NotificationSettingsService {
  constructor(
    @InjectRepository(NotificationSettings)
    private readonly notificationSettingsRepository: Repository<NotificationSettings>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private tutorialLinkService: TutorialLinksService,
    private datasource: DataSource,
  ) {}

  async createNotifSetting(
    user: UserEntity,
    payload: CreateNotificationSettingDto,
  ): Promise<DeepPartial<NotificationSettings>> {
    const notificationSetting = new NotificationSettings(payload);
    notificationSetting.user = user;

    const { user: existingUser, ...settings } =
      await this.notificationSettingsRepository.save(notificationSetting);
    return settings;
  }

  async updateNotifSetting(
    user: UserEntity,
    payload: UpdateNotificationSettingDto,
  ): Promise<NotificationSettings | object> {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const notificationSetting =
        await this.notificationSettingsRepository.findOne({
          where: { user: { id: user.id } },
        });

      if (!notificationSetting) {
        throw new HttpException(
          'Notification settings not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const tutorialLink = await this.usersRepository
        .createQueryBuilder('user')
        .leftJoin('user.tutorialLink', 'tl')
        .leftJoin('task_remind', 'tr', 'tr.userId = user.id')
        .select('tl.hasSetReminder', 'hasSetReminder')
        .addSelect('COUNT(tr.id)', 'remindCount')
        .where('user.id = :userId', { userId: user.id })
        .groupBy('tl.hasSetReminder')
        .getRawOne();

      let message: undefined | string;

      if (
        !notificationSetting.taskReminders &&
        payload.taskReminders &&
        !tutorialLink.hasSetReminder &&
        +tutorialLink.remindCount > 0
      ) {
        const existing = await this.usersRepository.findOneByOrFail({
          id: user.id,
        });

        message = await this.tutorialLinkService.update(
          existing,
          TutorialLinkField.HasSetReminder,
          queryRunner.manager,
        );
      }

      Object.assign(notificationSetting, payload);

      const updatedSettings = await queryRunner.manager.save(
        notificationSetting,
      );
      await queryRunner.commitTransaction();
      return message ? { updatedSettings, message } : updatedSettings;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
