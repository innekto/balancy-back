import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { AccentColor, Language, Role, Theme } from 'src/common';
import { TaskEntity } from 'src/tasks/entities/task.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LinkEntity } from '@/links/entities/link.entity';
import { NotificationSettings } from '@/notification-settings/entities/notification-settings.entity';
import { ReasonEntity } from '@/reasons/entities/reason.entity';
import { Session } from '@/session/entities/session.entity';
import { Subscription } from '@/subscription/entities/subscription.entity';
import { TagEntity } from '@/tags/entities/tag.entity';
import { TaskRemind } from '@/task-remind/entities/task-remind.entity';
import { TutorialLink } from '@/tutorial-links/entities/tutorial-link.entity';
import { UserBalanceEntity } from '@/user-balance/entities/user-balance.entity';

import { CreateUserDto } from '../dto/create-user.dto';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Column({ nullable: false, default: Role.User })
  role: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: 0, nullable: true })
  points: number;

  @Column({ type: 'enum', enum: Language, default: Language.Ukrainian })
  language: Language;

  @Column({ default: false })
  emailVerified: boolean;

  @Exclude()
  @Column({ nullable: true })
  emailVerificationToken: string;

  @Exclude()
  @Column({ nullable: true })
  passwordResetToken: string;

  @Exclude()
  @Column({ nullable: true })
  googleToken: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isLoggedIn: boolean;

  @Column({ default: true })
  memeReaction: boolean;

  @Column({ default: false })
  isAutoGenerateSubTasks: boolean;

  @Column({ type: 'integer', default: 6 })
  taskMinutes: number;

  @Column({ type: 'enum', enum: AccentColor, default: AccentColor.Default })
  accentColor: AccentColor;

  @Column({ type: 'enum', enum: Theme, default: Theme.Dark })
  theme: Theme;

  @Column({ type: 'varchar', nullable: true })
  createdAt: string;

  @Column({ type: 'varchar', nullable: true })
  updatedAt: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  deletedAt: string;

  @OneToMany(() => TagEntity, (tag) => tag.user)
  @ApiHideProperty()
  tags: TagEntity[];

  @OneToMany(() => TaskEntity, (task) => task.user)
  @ApiHideProperty()
  tasks: TaskEntity[];

  @OneToMany(() => LinkEntity, (link) => link.user)
  @ApiHideProperty()
  links: LinkEntity[];

  @OneToOne(() => UserBalanceEntity, (userBalance) => userBalance.user)
  userBalance: UserBalanceEntity;

  @OneToMany(() => TaskRemind, (remind) => remind.user)
  @ApiHideProperty()
  reminds: TaskRemind[];

  @ManyToMany(() => ReasonEntity, (reason) => reason.users, {
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'users_to_reasons' })
  reasons: ReasonEntity[];

  @OneToOne(
    () => NotificationSettings,
    (notificationSettings) => notificationSettings.user,
    {
      cascade: true,
      eager: true,
    },
  )
  @ApiHideProperty()
  notificationSettings: NotificationSettings;

  @OneToOne(() => TutorialLink, (tutorial) => tutorial.user, { eager: true })
  @Exclude()
  tutorialLink: TutorialLink;

  @OneToMany(() => Subscription, (sub) => sub.user)
  @ApiHideProperty()
  subscriptions: Subscription[];

  @OneToMany(() => Session, (session) => session.user, {
    eager: true,
  })
  sessions: Session[];

  constructor(user?: Partial<CreateUserDto>) {
    if (!user) return;
    this.email = user.email;
    this.username = user.email
      .split('@')[0]
      .replace(/^\w/, (c) => c.toUpperCase());
    this.createdAt = new Date().toISOString();
  }
}
