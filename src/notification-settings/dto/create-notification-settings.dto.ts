import { IsBoolean, IsOptional } from 'class-validator';

export class CreateNotificationSettingDto {
  @IsOptional()
  @IsBoolean()
  readonly browserChannel?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly systemChannel?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly eventReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly taskReminders?: boolean;
}
