import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from '@/users/entities/user.entity';

@Entity()
export class TutorialLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  hasCreatedTask: boolean;

  @Column({ default: false })
  hasAddedTag: boolean;

  @Column({ default: false })
  hasSetReminder: boolean;

  @OneToOne(() => UserEntity, (user) => user.tutorialLink, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
