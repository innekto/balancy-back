import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { TasksService } from '@/tasks/tasks.service';
import { UsersService } from '@/users/users.service';

import { CreateReasonDto } from './dto/create-reason.dto';
import { ReasonEntity } from './entities/reason.entity';

@Injectable()
export class ReasonsService {
  constructor(
    @InjectRepository(ReasonEntity)
    private readonly reasonRepository: Repository<ReasonEntity>,
    private datasource: DataSource,
    private taskService: TasksService,
    private userService: UsersService,
  ) {}

  async create(
    userId: number,
    taskId: number,
    payload: CreateReasonDto,
  ): Promise<{ taskId: number; reason: ReasonEntity[] }> {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;

    try {
      const user = await this.userService.findOneByParams({ id: userId }, [
        'reasons',
      ]);

      const task = await this.taskService.findOne(userId, taskId);

      const currentDate = new Date().toISOString();

      const isAnyReasonExpired = task.reasons?.some(
        (reason) => reason.newTaskDeadline < currentDate,
      );

      const isTaskExpired = task.deadline < currentDate;

      if (isAnyReasonExpired || isTaskExpired) {
        throw new ConflictException("You can't reschedule an expired task");
      }

      const newReason = new ReasonEntity(payload);

      user.reasons.push(newReason);
      task.reasons.push(newReason);

      await this.taskService.saveTask(task, manager);
      await this.userService.saveUser(user, manager);

      await manager.save(newReason);

      await queryRunner.commitTransaction();
      return { taskId: task.id, reason: task.reasons };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId: number, taskId: number): Promise<ReasonEntity[]> {
    try {
      const task = await this.taskService.findOne(userId, taskId);
      return task.reasons;
    } catch (error) {
      throw error;
    }
  }
}
