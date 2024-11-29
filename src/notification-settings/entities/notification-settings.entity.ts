import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from '@/users/entities/user.entity';

import { CreateNotificationSettingDto } from '../dto/create-notification-settings.dto';

@Entity({ name: 'notification-settings' })
export class NotificationSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  eventReminders: boolean;

  @Column({ default: false })
  taskReminders: boolean;

  @Column({ default: false })
  browserChannel: boolean;

  @Column({ default: false })
  systemChannel: boolean;

  @OneToOne(() => UserEntity, (user) => user.notificationSettings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  constructor(payload?: CreateNotificationSettingDto) {
    if (!payload) return;

    this.eventReminders = payload.eventReminders;
    this.taskReminders = payload.taskReminders;
    this.browserChannel = payload.browserChannel;
    this.systemChannel = payload.systemChannel;
  }
}
