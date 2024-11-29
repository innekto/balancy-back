import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Reasons } from '@/common';
import { TaskEntity } from '@/tasks/entities/task.entity';
import { UserEntity } from '@/users/entities/user.entity';

import { CreateReasonDto } from '../dto/create-reason.dto';

@Entity({ name: 'reasons' })
export class ReasonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Reasons })
  reason: Reasons;

  @Column({ type: 'varchar' })
  newTaskDeadline: string;

  @CreateDateColumn({ type: 'varchar' })
  createdAt: string;

  @ManyToMany(() => TaskEntity, (task) => task.reasons, { onDelete: 'CASCADE' })
  @JoinTable({ name: 'tasks_to_reasons' })
  tasks: TaskEntity[];

  @ManyToMany(() => UserEntity, (user) => user.reasons)
  @JoinTable({ name: 'users_to_reasons' })
  users: UserEntity[];

  constructor(payload?: CreateReasonDto) {
    if (!payload) return;
    this.reason = payload.reason;
    this.newTaskDeadline = payload.newTaskDeadline;
    this.createdAt = new Date().toISOString();
  }
}
