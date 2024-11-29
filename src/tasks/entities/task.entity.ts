import { ApiHideProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Priority, TaskCategories, Type } from '@/common';
import { LinkEntity } from '@/links/entities/link.entity';
import { ReasonEntity } from '@/reasons/entities/reason.entity';
import { SubTaskEntity } from '@/sub-tasks/entities/sub-task.entity';
import { TagEntity } from '@/tags/entities/tag.entity';
import { TaskImage } from '@/task-images/entities/task-image.entity';
import { TaskRemind } from '@/task-remind/entities/task-remind.entity';

import { CreateTaskDto } from '../dto/create-task.dto';

@Entity({ name: 'tasks' })
export class TaskEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Type, default: Type.Task })
  type: Type;

  @Column()
  title: string;

  @Column({ default: '' })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskCategories,
    default: TaskCategories.Work,
  })
  category: TaskCategories;

  @Column({ type: 'enum', enum: Priority, default: Priority.Medium })
  priority: Priority;

  @Column({ default: true })
  pinned: boolean;

  @Column({ nullable: true })
  geolocation: string;

  @Column({ type: 'varchar' })
  createDate: string;

  @Column({ type: 'varchar', nullable: true })
  startDate: string | null;

  @Column({ type: 'varchar', nullable: true })
  deadline: string | null;

  @Column({ type: 'varchar', default: null, nullable: true })
  completeDate: string | null;

  @Column({ type: 'bigint', default: 1 })
  duration: number;

  @ManyToOne(() => UserEntity, (user) => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @OneToMany(() => SubTaskEntity, (subTask) => subTask.task)
  @ApiHideProperty()
  subTasks: SubTaskEntity[];

  @OneToMany(() => LinkEntity, (link) => link.task, { cascade: true })
  links: LinkEntity[];

  @OneToMany(() => TaskRemind, (remind) => remind.task)
  reminds: TaskRemind[];

  @OneToMany(() => TaskImage, (image) => image.task, {
    eager: true,
  })
  images: TaskImage[];

  @ManyToMany(() => TagEntity, (tag) => tag.tasks, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'tags_to_tasks' })
  tags: TagEntity[];

  @ManyToMany(() => ReasonEntity, (reason) => reason.tasks, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'tasks_to_reasons' })
  reasons: ReasonEntity[];

  constructor(payload?: CreateTaskDto) {
    if (!payload) return;
    this.title = payload.title;
    this.description = payload.description;
    this.category = payload.category;
    this.type = payload.type;
    this.priority = payload.priority;
    this.pinned = payload.pinned;
    this.geolocation = payload.geolocation;
    this.startDate = payload.startDate;
    this.deadline = payload.deadline;
    this.createDate = new Date().toISOString();
    if (payload.deadline) {
      this.duration =
        new Date(this.deadline).getTime() - new Date(this.startDate).getTime();
    } else {
      this.duration = 0;
    }
  }
}
