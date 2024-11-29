import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  format,
  startOfMonth,
} from 'date-fns';
import {
  DataSource,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';

import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import {
  categoryOnCompletion,
  convertToLocalTime,
  datesForEventReminder,
  formatToHoursMinutesSeconds,
  getDifferenceInDays,
  getPairedIntervals,
  groupIntervals,
  handleTaskCreationErrors,
  isDeadlineAfterStartDate,
  isValidCategory,
  subNormalizer,
  // subTaskGenerator,
  TaskCategories,
  taskReminderBody,
  tasksOnIntervals,
  TutorialLinkField,
  Type,
} from '@/common';
import { CreateLinkDto } from '@/links/dto/create-link.dto';
import { LinkEntity } from '@/links/entities/link.entity';
import { LinksService } from '@/links/links.service';
import { TaskSchedulerService } from '@/schedule-job/task-schedule-job.service';
import { SubTaskEntity } from '@/sub-tasks/entities/sub-task.entity';
import { Subscription } from '@/subscription/entities/subscription.entity';
import { TagsService } from '@/tags/tags.service';
import { TaskImagesService } from '@/task-images/task-images.service';
import { TaskRemind } from '@/task-remind/entities/task-remind.entity';
import { TaskEntity } from '@/tasks/entities/task.entity';
import { TutorialLinksService } from '@/tutorial-links/tutorial-links.service';
import { UserEntity } from '@/users/entities/user.entity';

import { CreateTaskRemindDto } from '../task-remind/dto/create-task-remind.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly linksService: LinksService,
    private tagsService: TagsService,
    private schedulerService: TaskSchedulerService,
    private tutorialLinkService: TutorialLinksService,
    private taskImageService: TaskImagesService,
    private datasource: DataSource,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getTaskHoursStatistic(userId: number, date: string, offset: number) {
    const data = await this.userRepository
      .createQueryBuilder('user')
      .select('user.taskMinutes AS "userTaskMinutes"')
      .where('user.id = :userId', { userId })
      .getRawOne();

    const userTaskMinutes = data.userTaskMinutes;

    const pairedIntervals = getPairedIntervals(date, offset);

    const result = await Promise.all(
      pairedIntervals.map(async (pare, i) => {
        const data = await this.taskRepository
          .createQueryBuilder('task')
          .select('SUM(task.duration)', 'totalDuration')
          .where('task.userId = :userId', { userId })
          .andWhere('task.startDate BETWEEN :startDate AND :endDate', {
            startDate: pare[0],
            endDate: pare[1],
          })
          .getRawOne();

        const perc = +(
          (data.totalDuration / (userTaskMinutes * 1000 * 60)) *
          100
        ).toFixed(2);

        return { date: i + 1, workloadPercentage: perc };
      }),
    );

    return result;
  }

  async saveTask(
    task: TaskEntity,
    manager: EntityManager,
  ): Promise<TaskEntity> {
    return await manager.save(task);
  }

  async searchTasks(
    title: string,
    userId: number,
    limit: number,
    page: number,
  ): Promise<
    | {
        data: TaskEntity[];
        total: number;
        page: number;
        limit: number;
      }
    | { message: string }
  > {
    if (title.startsWith('#')) {
      return await this.tagsService.findOneForTasks(
        title.slice(1).toLowerCase(),
        page,
        limit,
      );
    }
    const [tasks, total] = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.subTasks', 'subTasks')
      .leftJoinAndSelect('task.links', 'links')
      .where('task.userId = :userId', { userId })
      .andWhere('task.title LIKE :query', { query: `%${title}%` })
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    if (!total) {
      return { message: 'tasks not found' };
    }

    return {
      data: tasks,
      total,
      page: +page,
      limit: +limit,
    };
  }

  async findAllByParams(
    params: Record<string, any>,
    relations?: string[],
  ): Promise<TaskEntity[]> {
    const queryOptions: FindManyOptions<TaskEntity> = {
      where: params,
      relations: relations,
    };
    const tasks = await this.taskRepository.find(queryOptions);
    return tasks;
  }

  async findOneByParams(
    params: Record<string, any>,
    relations?: string[],
  ): Promise<TaskEntity> {
    const queryOptions: FindOneOptions<TaskEntity> = {
      where: params,
      relations: relations,
    };
    const task = await this.taskRepository.findOneOrFail(queryOptions);
    return task;
  }

  async findAll(userId: number) {
    const tasks = await this.findAllByParams({ user: { id: userId } }, [
      'subTasks',
      'links',
    ]);
    return tasks;
  }

  async findTasksWithReasons(
    userId: number,
    startDate: string,
    endDate: string,
  ): Promise<TaskEntity[]> {
    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.reasons', 'reason')
      .where('task.userId = :userId AND reason IS NOT NULL')
      .andWhere('DATE(task.startDate) BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .setParameters({ userId })
      .getMany();

    return tasks;
  }

  async findTasks(userId: number) {
    const tasks = await this.findAllByParams(
      { user: { id: userId }, type: Type.Task },
      ['subTasks', 'links'],
    );
    return tasks;
  }

  async findEvents(userId: number) {
    const events = await this.findAllByParams({
      user: { id: userId },
      type: Type.Event,
    });
    return events;
  }

  async create(
    user: UserEntity,
    payload: CreateTaskDto,
    offset: number,
    images?: Express.Multer.File[],
  ) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const createdPublicIds: string[] = [];

    try {
      const { startDate, deadline } = payload;

      // temporarily!
      const differenceDays = getDifferenceInDays(deadline, startDate, offset);
      if (differenceDays >= 1) {
        throw new ConflictException('The task should be limited to one day!');
      }

      isDeadlineAfterStartDate(startDate, deadline);
      handleTaskCreationErrors(payload);

      const existUser = await this.userRepository.findOneOrFail({
        where: {
          id: user.id,
        },
        relations: ['subscriptions', 'tutorialLink'],
      });

      const {
        tagsName = [],
        links = [],
        subTasks = [],
        reminds = [],
      } = payload;

      const newTask = new TaskEntity(payload);

      let autoReminder: TaskRemind | undefined;

      //create event reminders with transaction
      if (payload.type === Type.Event) {
        const { localTime, twentyOne, localStartDate, nextDayStart } =
          datesForEventReminder(offset, newTask.startDate);

        if (
          existUser.notificationSettings.eventReminders &&
          localTime < twentyOne &&
          formatToHoursMinutesSeconds(localStartDate) > nextDayStart
        ) {
          const remindDate = new Date(
            new Date(
              localStartDate.setUTCDate(localStartDate.getUTCDate() - 1),
            ).setUTCHours(21, 0, 0, 0),
          );

          autoReminder = await this.createEventAutoRemind(
            remindDate,
            existUser,
            queryRunner.manager,
          );
        }
      }

      //links creating with transaction
      let newLinks: LinkEntity[] | undefined;
      if (links?.length) {
        newLinks = await this.createLinksForNewTask(
          links,
          existUser,
          queryRunner.manager,
        );
      }

      //auto subtasks with transaction
      const allNewSubTasks = [];

      // temporarily!
      // if (existUser.isAutoGenerateSubTasks) {
      //   const differenceDays = getDifferenceInDays(deadline, startDate, offset);
      //   if (differenceDays > 0) {
      //     const subTasks = subTaskGenerator(
      //       differenceDays,
      //       newTask.startDate,
      //       newTask.title,
      //     );

      //     const savedAutoSubTask = await Promise.all(
      //       subTasks.map(async (autoSubTask) => {
      //         return await queryRunner.manager.save(autoSubTask);
      //       }),
      //     );
      //     allNewSubTasks.push(...savedAutoSubTask);
      //   }
      // }

      // create subtasks
      if (subTasks.length) {
        const newSubTasks = await Promise.all(
          subTasks.map(async (subTaskPayload) => {
            const newSubTask = new SubTaskEntity(subTaskPayload);

            return await queryRunner.manager.save(newSubTask);
          }),
        );

        allNewSubTasks.push(...newSubTasks);
      }

      let congratsMessage: undefined | string;

      //create reminds for nеw task with transactions
      let reminders: TaskRemind[] | undefined;
      if (reminds?.length) {
        const dates = reminds.map((r) => r.remindDate);
        const isFutureDate = dates.some((d) => d > deadline);

        if (isFutureDate) {
          throw new ConflictException(
            'Reminder date cannot be later than the deadline!',
          );
        }

        const uniqueDates = new Set(dates);
        if (uniqueDates.size !== dates.length) {
          throw new ConflictException('Reminder dates cannot be the same!');
        }

        const { newReminders, message } = await this.createRemindersForNewTask(
          reminds,
          existUser,
          queryRunner.manager,
        );
        reminders = newReminders;

        congratsMessage = message;
      }

      if (!existUser.tutorialLink.hasCreatedTask) {
        const result = await this.tutorialLinkService.update(
          existUser,
          TutorialLinkField.HasCreatedTask,
          queryRunner.manager,
        );
        congratsMessage = result;
      }

      newTask.tags = tagsName?.length
        ? await this.tagsService.handleTagsForNewTask(tagsName, existUser.id)
        : [];

      newTask.user = existUser;
      newTask.reminds = [
        ...(autoReminder ? [autoReminder] : []),
        ...(reminders ? reminders : []),
      ];

      newTask.links = newLinks ? [...newLinks] : [];
      newTask.subTasks = [...allNewSubTasks];

      if (images) {
        const { taskImages, publicIds } =
          await this.taskImageService.createForNewTask(
            images,
            queryRunner.manager,
          );
        newTask.images = [...taskImages];
        createdPublicIds.push(...publicIds);
      }
      //the right moment to save the task
      const createdTask = await queryRunner.manager.save(newTask);

      //send reminders
      if (
        reminds &&
        existUser.notificationSettings.taskReminders &&
        existUser.subscriptions.length &&
        existUser.notificationSettings.browserChannel
      ) {
        const remindsDates = reminds.map((r) => r.remindDate);
        await this.sendRemindersForNewTask(
          remindsDates,
          existUser.subscriptions,
          newTask.deadline,
          newTask.title,
          offset,
        );
      }

      //send event auto reminders
      if (
        payload.type === Type.Event &&
        existUser.subscriptions.length &&
        existUser.notificationSettings.eventReminders
      ) {
        const { localStartDate } = datesForEventReminder(
          offset,
          newTask.startDate,
          true,
        );

        const remindDate = new Date(
          new Date(
            localStartDate.setUTCDate(localStartDate.getUTCDate() - 1),
          ).setUTCHours(21, 0, 0, 0),
        );

        await this.sendEventAutoReminder(
          existUser.username,
          existUser.subscriptions,
          localStartDate,
          remindDate,
          payload.title,
        );
      }

      const { tags, user: taskUser, ...task } = createdTask;

      const response = congratsMessage
        ? {
            task,
            tags: tags.map((t) => {
              return { name: t.name, id: t.id };
            }),
            congratsMessage,
          }
        : {
            task,
            tags: tags.map((t) => {
              return { name: t.name, id: t.id };
            }),
          };
      await queryRunner.commitTransaction();
      return response;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (createdPublicIds.length) {
        await Promise.all(
          createdPublicIds.map(async (id) => {
            await this.cloudinaryService.deleteFile(id);
          }),
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(userId: number, taskId: number, payload: UpdateTaskDto) {
    const task = await this.taskRepository.findOneOrFail({
      where: { user: { id: userId }, id: taskId },
    });

    await this.taskRepository.update(task.id, payload);

    const updatedTask = await this.findOne(userId, taskId);
    return updatedTask;
  }

  async remove(userId: number, taskId: number) {
    const task = await this.taskRepository.findOneOrFail({
      where: { id: taskId, user: { id: userId } },
      select: ['id'],
    });

    await this.taskRepository.remove(task);
    return task;
  }

  async deleteAll(userId: number) {
    const tasks = await this.taskRepository.find({
      where: { user: { id: userId } },
      select: ['id'],
    });
    await this.taskRepository.remove(tasks);
  }

  async findOne(userId: number, taskId: number): Promise<TaskEntity> {
    const task = await this.findOneByParams(
      { id: taskId, user: { id: userId } },
      ['tags', 'subTasks', 'reasons', 'reminds', 'links'],
    );

    return task;
  }

  async addTagsToTask(userId: number, taskId: number, tags: Array<string>) {
    const task = await this.taskRepository.findOneOrFail({
      where: {
        id: taskId,
        user: { id: userId },
      },
      relations: ['tags'],
    });
    const existingTagNames = task.tags.map((tag) => tag.name);
    const existingTags = await this.tagsService.handleTagsForNewTask(
      tags,
      userId,
    );
    const duplicateTags = existingTags.filter((tag) =>
      existingTagNames.includes(tag.name),
    );

    if (duplicateTags.length > 0) {
      throw new ConflictException(
        `Tags are already attached to the task: ${duplicateTags
          .map((tag) => tag.name)
          .join(', ')}`,
      );
    }
    task.tags.push(...existingTags);

    return await this.taskRepository.save(task);
  }

  async getTasksOnCategory(
    userId: number,
    category: TaskCategories,
  ): Promise<TaskEntity[]> {
    if (!isValidCategory(category)) {
      throw new ConflictException('No such category exists');
    }
    const tasksOnCategory = await this.findAllByParams(
      {
        category,
        user: { id: userId },
      },
      ['tags', 'subTasks', 'links'],
    );
    return tasksOnCategory;
  }

  async toggleTaskStatus(userId: number, taskId: number): Promise<TaskEntity> {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;
    try {
      const user = await manager.findOneByOrFail(UserEntity, { id: userId });

      const task = await manager.findOneOrFail(TaskEntity, {
        where: {
          id: taskId,
          user: { id: userId },
        },
        relations: ['subTasks', 'reasons'],
      });

      const uncompleteSubTasks = task.subTasks.filter(
        (subtask) => !subtask.completeDate,
      );

      if (uncompleteSubTasks.length > 0) {
        throw new ConflictException('Some sub task is not completed');
      }

      const taskDeadline = task.reasons.length
        ? task.reasons.sort((a, b) => b.id - a.id)[0].newTaskDeadline
        : task.deadline;

      const isSuccessfulCompleted =
        task.completeDate && task.completeDate < taskDeadline;

      const newCompleteDate = task.completeDate
        ? null
        : new Date().toISOString();

      const isSuccessfulComplete =
        newCompleteDate && newCompleteDate < taskDeadline;

      task.completeDate = newCompleteDate;
      await manager.save(task);

      if (isSuccessfulComplete) {
        user.points += 10;
      }
      if (isSuccessfulCompleted) {
        user.points -= 10;
      }

      if (isSuccessfulComplete || isSuccessfulCompleted) {
        await manager.save(UserEntity, user);
      }
      await queryRunner.commitTransaction();
      const updatedTask = await this.findOne(userId, taskId);
      return updatedTask;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTasksStatisticsForPeriod(
    userId: number,
    startDate: string,
    endDate: string,
  ): Promise<object> {
    const user = await this.userRepository.findOneByOrFail({ id: userId });

    const tasksStatistics = await this.taskRepository
      .createQueryBuilder('task')
      .select('COUNT(task.id) as "taskCount"')
      .addSelect(
        'COUNT(CASE WHEN task.completeDate IS NOT NULL THEN 1 END) as "completedTasksCount"',
      )
      .addSelect(
        'SUM(CASE WHEN task.category = :workCategory AND task.completeDate IS NOT NULL THEN 1 ELSE 0 END)',
        'work',
      )
      .addSelect(
        'SUM(CASE WHEN task.category = :lifeCategory AND task.completeDate IS NOT NULL THEN 1 ELSE 0 END)',
        'life',
      )
      .addSelect(
        'SUM(CASE WHEN task.category = :learningCategory AND task.completeDate IS NOT NULL THEN 1 ELSE 0 END)',
        'learning',
      )
      .where('task.userId = :userId', { userId: user.id })
      .andWhere('task.type = :taskType', { taskType: Type.Task })
      .andWhere('DATE(task.startDate) BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .setParameters({
        userId,
        workCategory: TaskCategories.Work,
        lifeCategory: TaskCategories.Life,
        learningCategory: TaskCategories.Learning,
        startDate,
        endDate,
      })
      .getRawOne();

    const { taskCount, completedTasksCount, work, life, learning } =
      tasksStatistics;

    return {
      taskCount: +taskCount,
      completedTasksCount: +completedTasksCount,
      work: +work,
      life: +life,
      learning: +learning,
    };
  }

  async getChartCompletetStatisticsForPeriod(
    userId: number,
    startDate: string,
    endDate: string,
    offset: number,
  ) {
    const userStartDate = new Date(
      new Date(startDate).getTime() - offset * 60000,
    );
    const userEndDate = new Date(new Date(endDate).getTime() - offset * 60000);
    const endOfEndDate = endOfDay(userEndDate);

    const intervalDates = eachDayOfInterval({
      start: userStartDate,
      end: userEndDate,
    }).map((date) => format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS"));

    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .select([
        'task.category AS category',
        'task.deadline AS deadline',
        'task.completeDate as "completeDate"',
      ])
      .where('task.userId = :userId', { userId })
      .andWhere('task.type=:taksType', { taksType: Type.Task })
      .andWhere('DATE(task.completeDate) BETWEEN :startDate AND :endDate', {
        startDate: startDate,
        endDate: endOfEndDate,
      })
      .getRawMany();

    const futureTasks = tasks.filter(
      (task) => task.deadline > endOfEndDate.toISOString(),
    ).length;
    const pastTasks = tasks.filter(
      (task) => task.deadline < task.completeDate,
    ).length;

    const tasksIntervals = tasksOnIntervals(tasks, intervalDates);
    const intervals = groupIntervals(tasksIntervals);
    return {
      intervals,
      pastTasks,
      futureTasks,
      totalCompletedTasks: tasks.length,
    };
  }

  async getStaTisticOnCopmletion(userId: number): Promise<object> {
    const { tasks, rescheduledTasks, completedTasks, failedTasks } =
      await this.getTaskForStatisticOnComletion(userId);

    return {
      allTasks: tasks.length,
      completedTasks: completedTasks.length,
      rescheduledTasks: rescheduledTasks.length,
      failedTasks: failedTasks.length,
    };
  }

  async getStaTisticOnCopmletionByCategory(
    category: TaskCategories,
    userId: number,
  ): Promise<object> {
    const { tasks, rescheduledTasks, completedTasks, failedTasks } =
      await this.getTaskForStatisticOnComletion(userId);

    return categoryOnCompletion(
      tasks,
      rescheduledTasks,
      completedTasks,
      failedTasks,
      category,
    );
  }

  async deleteTaskImages(userId: number, taskId: number, imageIds: number[]) {
    return await this.taskImageService.removeTaskImages(
      userId,
      taskId,
      imageIds,
    );
  }

  async addImages(
    userId: number,
    taskId: number,
    payload: Express.Multer.File[],
  ) {
    const existingTask = await this.taskRepository.findOneOrFail({
      where: {
        id: taskId,
        user: { id: userId },
      },
      relations: ['images'],
    });

    const imagesLenght = existingTask.images.length;

    if (imagesLenght === 5 || imagesLenght + payload.length > 5) {
      throw new ConflictException('Task can have only 5 images');
    }

    const taskImages = await this.taskImageService.addTaskImages(payload);
    existingTask.images.push(...taskImages);

    await this.taskRepository.save(existingTask);
  }

  private async getTaskForStatisticOnComletion(userId: number) {
    const tasks = await this.getTasksWithReasons(userId, Type.Task);

    const now = new Date().toISOString();
    const categorizedTasks = {
      rescheduledTasks: [] as TaskEntity[],
      completedTasks: [] as TaskEntity[],
      failedTasks: [] as TaskEntity[],
    };

    tasks.forEach((task) => {
      const deadline = task.newTaskDeadline || task.deadline;
      const isOverdue = task.newTaskDeadline
        ? task.newTaskDeadline < now && !task.completeDate
        : task.completeDate
        ? task.completeDate > deadline
        : task.deadline < now && !task.completeDate;

      if (task.newTaskDeadline > now && !task.completeDate) {
        categorizedTasks.rescheduledTasks.push(task);
      } else if (task.completeDate) {
        if (task.completeDate < deadline) {
          categorizedTasks.completedTasks.push(task);
        } else if (task.completeDate > deadline) {
          categorizedTasks.failedTasks.push(task);
        }
      } else if (isOverdue) {
        categorizedTasks.failedTasks.push(task);
      }
    });

    return {
      tasks,
      rescheduledTasks: categorizedTasks.rescheduledTasks,
      completedTasks: categorizedTasks.completedTasks,
      failedTasks: categorizedTasks.failedTasks,
    };
  }

  private async getTasksWithReasons(
    userId: number,
    taskType: string,
  ): Promise<any[]> {
    return await this.taskRepository
      .createQueryBuilder('task')
      .leftJoin('task.reasons', 'reason')
      .select([
        'task.id AS id',
        'task.deadline AS deadline',
        'task.category AS category',
        'task.completeDate AS "completeDate"',
        'MAX(reason.newTaskDeadline) AS "newTaskDeadline"',
      ])
      .where('task.userId = :userId', { userId })
      .andWhere('task.type = :taskType', { taskType })
      .orderBy('task.id', 'DESC')
      .groupBy('task.id')
      .getRawMany();
  }

  private async createRemindersForNewTask(
    reminds: CreateTaskRemindDto[],
    user: UserEntity,
    manager: EntityManager,
  ) {
    if (reminds.some((r) => r.remindDate < new Date().toISOString())) {
      throw new BadRequestException('Reminder date should not be in the past');
    }

    const newReminders = await Promise.all(
      reminds.map(async (remind) => {
        const newRemind = new TaskRemind(remind);

        newRemind.user = user;

        return await manager.save(newRemind);
      }),
    );
    let message: string | undefined;
    if (
      user.notificationSettings.taskReminders &&
      !user.tutorialLink.hasSetReminder
    ) {
      const result = await this.tutorialLinkService.update(
        user,
        TutorialLinkField.HasSetReminder,
        manager,
      );
      message = result;
    }
    return { newReminders, message };
  }

  private async sendRemindersForNewTask(
    remindsDates: string[],
    userSubscriptions: Subscription[],
    taskDeadline: string,
    taskTitle: string,
    offset: number,
  ) {
    const reminderPayload = taskReminderBody(
      userSubscriptions,
      taskDeadline,
      taskTitle,
      offset,
    );

    await Promise.all(
      remindsDates.map(async (remindDate) => {
        const reminderDate = new Date(remindDate);

        await Promise.all(
          reminderPayload.subs.map(async (sub) => {
            await this.schedulerService.taskReminder(
              reminderDate,
              sub,
              reminderPayload.payload,
            );
          }),
        );
      }),
    );
  }

  private async createLinksForNewTask(
    links: CreateLinkDto[],
    user: UserEntity,
    manager: EntityManager,
  ) {
    const newLinks = await Promise.all(
      links.map(async (linkPayload) => {
        return await this.linksService.createLinkFornewTask(
          user,
          linkPayload,
          manager,
        );
      }),
    );
    return newLinks;
  }

  private async createEventAutoRemind(
    remindDate: Date,
    user: UserEntity,
    manager: EntityManager,
  ) {
    const newRemind = new TaskRemind();

    newRemind.remindDate = remindDate.toISOString();
    newRemind.user = user;

    return await manager.save(newRemind);
  }

  private async sendEventAutoReminder(
    username: string,
    userSubscriptions: any,
    localStartDay: Date,
    remindDate: Date,
    taskTitle: string,
  ) {
    const subscriptions = subNormalizer(userSubscriptions);
    const payload = JSON.stringify({
      title: 'Incoming event',
      body: `Привіт ${username}! Не забувай про заплановані події на завтра о ${localStartDay
        .toISOString()
        .split('T')[1]
        .slice(0, 5)} - ${taskTitle} `,
    });
    await Promise.all(
      subscriptions.map(async (sub) => {
        await this.schedulerService.eventReminder(remindDate, sub, payload);
      }),
    );
  }
}
