import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TaskEntity } from '@/tasks/entities/task.entity';
import { UserEntity } from '@/users/entities/user.entity';

import { CreateLinkDto } from '../dto/create-link.dto';

@Entity({ name: 'links' })
export class LinkEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column()
  url: string;

  @ManyToOne(() => TaskEntity, (task) => task.links, { onDelete: 'CASCADE' })
  task: TaskEntity;

  @ManyToOne(() => UserEntity, (user) => user.links, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  constructor(payload?: CreateLinkDto, taskId?: number) {
    if (payload) {
      this.name = payload.name;
      this.url = payload.url;
    }
    if (taskId) {
      this.task = { id: taskId } as any;
    }
  }
}
