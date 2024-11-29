import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TasksService } from '@/tasks/tasks.service';

import { CreateSubTaskDto } from './dto/create-sub-task.dto';
import { UpdateSubTaskDto } from './dto/update-sub-task.dto';
import { SubTaskEntity } from './entities/sub-task.entity';

@Injectable()
export class SubTasksService {
  constructor(
    @InjectRepository(SubTaskEntity)
    private readonly subTaskRepository: Repository<SubTaskEntity>,
    private readonly tasksService: TasksService,
  ) {}

  // checks if task exist if don't exist throws 404 error
  async taskExist(userId: number, taskId: number) {
    const task = await this.tasksService.findOneByParams({
      id: taskId,
      user: { id: userId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async getAll(userId: number, taskId: number) {
    const { subTasks } = await this.tasksService.findOneByParams(
      {
        id: taskId,
        user: { id: userId },
      },
      ['subTasks'],
    );
    return subTasks;
  }

  async getOne(userId: number, taskId: number, subTaskId: number) {
    await this.taskExist(userId, taskId);

    return this.subTaskRepository.findOneOrFail({
      where: { task: { id: taskId }, id: subTaskId },
    });
  }

  async createOne(userId: number, taskId: number, payload: CreateSubTaskDto) {
    const task = await this.taskExist(userId, taskId);

    const subTask = new SubTaskEntity(payload);
    subTask.task = task;

    const createdSubTask = await this.subTaskRepository.save(subTask);

    return {
      ...createdSubTask,
      task: undefined,
    };
  }

  async deleteOne(userId: number, taskId: number, subTaskId: number) {
    await this.taskExist(userId, taskId);

    const subTask = await this.subTaskRepository.findOne({
      where: { task: { id: taskId }, id: subTaskId },
    });

    await this.subTaskRepository.remove(subTask);
  }

  async updateOne(
    userId: number,
    taskId: number,
    subTaskId: number,
    payload: UpdateSubTaskDto,
  ) {
    const subTask = await this.getOne(userId, taskId, subTaskId);

    await this.subTaskRepository.update(subTask.id, payload);

    return await this.subTaskRepository.findOneOrFail({
      where: { id: subTaskId, task: { id: taskId } },
    });
  }

  async toggleStatus(userId: number, taskId: number, subTaskId: number) {
    const subTask = await this.getOne(userId, taskId, subTaskId);

    subTask.completeDate = subTask.completeDate
      ? null
      : new Date().toISOString();

    return await this.subTaskRepository.save(subTask);
  }
}
