import { Body, Controller, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';

import { ApiCustomResponse, User } from '@/common';
import { UserEntity } from '@/users/entities/user.entity';

import responses from '../responses.json';
import { CreateNotificationSettingDto } from './dto/create-notification-settings.dto';
import { UpdateNotificationSettingDto } from './dto/update-notification-setting.dto';
import { NotificationSettings } from './entities/notification-settings.entity';
import { NotificationSettingsService } from './notification-settings.service';

@Controller('notification-settings')
@ApiTags('Notification settings')
export class NotificationSettingsController {
  constructor(
    private readonly notificationSettingService: NotificationSettingsService,
  ) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiCustomResponse(
    HttpStatus.CREATED,
    responses.createOrUpdateNotificationSettings,
  )
  async create(
    @User() user: UserEntity,
    @Body() payload: CreateNotificationSettingDto,
  ): Promise<DeepPartial<NotificationSettings>> {
    return await this.notificationSettingService.createNotifSetting(
      user,
      payload,
    );
  }

  @Patch('update')
  @ApiBearerAuth('JWT-auth')
  @ApiCustomResponse(
    HttpStatus.OK,
    responses.createOrUpdateNotificationSettings,
  )
  async update(
    @User() user: UserEntity,
    @Body() payload: UpdateNotificationSettingDto,
  ): Promise<NotificationSettings | object> {
    return await this.notificationSettingService.updateNotifSetting(
      user,
      payload,
    );
  }
}
