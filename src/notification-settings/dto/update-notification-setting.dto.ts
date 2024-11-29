import { PartialType } from '@nestjs/swagger';

import { CreateNotificationSettingDto } from './create-notification-settings.dto';

export class UpdateNotificationSettingDto extends PartialType(
  CreateNotificationSettingDto,
) {}
