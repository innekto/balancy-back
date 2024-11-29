import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TaskEntity } from '@/tasks/entities/task.entity';
import { UserEntity } from '@/users/entities/user.entity';

@Entity({ name: 'tag' })
export class TagEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @ManyToOne(() => UserEntity, (user) => user.tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToMany(() => TaskEntity, (task) => task.tags, { onDelete: 'CASCADE' })
  @JoinTable({ name: 'tags_to_tasks' })
  tasks: TaskEntity[];

  constructor(payload?: string) {
    if (!payload) return;
    this.name = payload;
  }
}
