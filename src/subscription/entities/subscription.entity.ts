import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from '@/users/entities/user.entity';

import { CreateSubscriptionDto } from '../dto/create-subscription.dto';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  endpoint: string;

  @Column({ nullable: true, default: null })
  expirationTime: number | null;

  @Column({ nullable: false, unique: true })
  p256dh: string;

  @Column({ nullable: false, unique: true })
  auth: string;

  @ManyToOne(() => UserEntity, (user) => user.subscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  constructor(payload: CreateSubscriptionDto) {
    if (!payload) return;
    this.auth = payload.auth;
    this.endpoint = payload.endpoint;
    this.expirationTime = payload.expirationTime;
    this.p256dh = payload.p256dh;
  }
}
