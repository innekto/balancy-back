import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TaskEntity } from '@/tasks/entities/task.entity';
import { UserEntity } from '@/users/entities/user.entity';

import { CreateTaskRemindDto } from '../dto/create-task-remind.dto';

@Entity({ name: 'task_remind' })
export class TaskRemind {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  remindDate: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @ManyToOne(() => UserEntity, (user) => user.reminds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => TaskEntity, (task) => task.reminds, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn({ name: 'taskId' })
  task: TaskEntity;

  constructor(payload?: CreateTaskRemindDto) {
    if (!payload) return;
    this.remindDate = payload.remindDate;
  }
}
