import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import {
  convertToLocalTime,
  formatToHoursAndMinutes,
  message,
  taskReminderBody,
  TutorialLinkField,
} from '@/common';
import { TaskSchedulerService } from '@/schedule-job/task-schedule-job.service';
import { TasksService } from '@/tasks/tasks.service';
import { TutorialLinksService } from '@/tutorial-links/tutorial-links.service';
import { UsersService } from '@/users/users.service';

import { CreateTaskRemindDto } from './dto/create-task-remind.dto';
import { TaskRemind } from './entities/task-remind.entity';

@Injectable()
export class TaskRemindService {
  constructor(
    @InjectRepository(TaskRemind)
    private readonly remindRepository: Repository<TaskRemind>,
    private taskService: TasksService,
    private userService: UsersService,
    private schedulerService: TaskSchedulerService,
    private tutorialLinkService: TutorialLinksService,
    private dataSource: DataSource,
  ) {}

  async create(
    userId: number,
    taskId: number,
    payload: CreateTaskRemindDto,
    offset: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reminderDate = new Date(payload.remindDate);

      const user = await this.userService.findOneByParams({ id: userId }, [
        'reminds',
        'subscriptions',
        'notificationSettings',
      ]);

      const task = await this.taskService.findOne(userId, taskId);

      const newRemind = new TaskRemind(payload);
      newRemind.user = user;
      newRemind.task = task;

      let message: undefined | string;

      if (
        user.notificationSettings.taskReminders &&
        !user.tutorialLink.hasSetReminder
      ) {
        const result = await this.tutorialLinkService.update(
          user,
          TutorialLinkField.HasSetReminder,
          queryRunner.manager,
        );
        message = result;
      }

      if (
        user.notificationSettings.taskReminders &&
        user.subscriptions.length &&
        user.notificationSettings.browserChannel
      ) {
        const { subs, payload } = taskReminderBody(
          user.subscriptions,
          task.deadline,
          task.title,
          offset,
        );

        await Promise.all(
          subs.map(async (sub) => {
            await this.schedulerService.taskReminder(
              reminderDate,
              sub,
              payload,
            );
          }),
        );
      }
      const createdReminder = await queryRunner.manager.save(newRemind);

      await queryRunner.commitTransaction();
      return message ? { createdReminder, message } : createdReminder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException();
    } finally {
      await queryRunner.release();
    }
  }

  async getAllReminders(
    userId: number,
    offset: number,
    limit: number,
    page: number,
  ) {
    const [items, total] = await this.remindRepository
      .createQueryBuilder('remind')
      .leftJoin('remind.task', 'task')
      .addSelect(['task.id', 'task.title', 'task.deadline', 'task.startDate'])
      .where('remind.userId = :userId', { userId })
      .orderBy('remind.remindDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const data = items.map((i) => {
      return {
        id: i.id,
        taskTitle: i.task.title,
        text: message(offset, i.task.deadline, i.task.startDate),
        remindDate: formatToHoursAndMinutes(
          convertToLocalTime(i.remindDate, offset),
        ),
        isRead: i.isRead,
      };
    });

    return { data, total, limit, page };
  }

  async markRemindersAsRead(userId: number) {
    const remindState = await this.remindRepository.find({
      where: { isRead: false, user: { id: userId } },
    });

    if (!remindState.length) {
      return { message: 'There are no unread reminders for the user' };
    }

    await this.remindRepository.update(
      { id: In(remindState.map((remind) => remind.id)) },
      { isRead: true },
    );

    return {
      message: 'Success: All unread reminders have been marked as read.',
    };
  }

  async deleteOneReminder(id: number, userId: number) {
    const result = await this.remindRepository.delete({
      id,
      user: { id: userId },
    });

    if (result.affected === 0) {
      throw new Error('This remind not found');
    }
  }

  async deleteReadReminders(userId: number): Promise<void> {
    await this.remindRepository.delete({ user: { id: userId }, isRead: true });
  }
}
