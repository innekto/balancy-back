// import { HttpException, HttpStatus } from '@nestjs/common';
// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// import { UserEntity } from '@/users/entities/user.entity';

// import { CreateTaskDto } from './dto/create-task.dto';
// import { UpdateTaskDto } from './dto/update-task.dto';
// import { TaskEntity } from './entities/task.entity';
// import { Priority, TaskCategories, Type } from './enums/enums';
// import { TasksService } from './tasks.service';

// const user = new UserEntity();

// const createTaskEntity = (overrides?: Partial<TaskEntity>): TaskEntity => ({
//   id: 1,
//   title: 'Default Title',
//   type: Type.Task,
//   description: 'Default Description',
//   category: TaskCategories.Work,
//   subCategory: 'Default Subcategory',
//   priority: Priority.Medium,
//   pinned: false,
//   createDate: new Date(),
//   completeDate: null,
//   user,
//   subTasks: [],
//   ...overrides,
// });

// const createTaskDto = (): CreateTaskDto => ({
//   title: 'string',
//   description: 'string',
//   category: TaskCategories.Work,
//   type: Type.Event || Type.Task,
//   subCategory: 'string',
//   priority: Priority.Medium,
//   pinned: true,
// });

// describe('TasksService', () => {
//   let service: TasksService;
//   let taskRepository: Repository<TaskEntity>;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         TasksService,
//         { provide: getRepositoryToken(TaskEntity), useClass: Repository },
//       ],
//     }).compile();

//     service = module.get<TasksService>(TasksService);
//     taskRepository = module.get<Repository<TaskEntity>>(
//       getRepositoryToken(TaskEntity),
//     );
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('findAll', () => {
//     it('should return an array of tasks for a valid user', async () => {
//       const userId = 1;

//       const tasks: TaskEntity[] = [
//         createTaskEntity({ id: 1, title: 'Task 1', type: Type.Event }),
//         createTaskEntity({ id: 2, title: 'Task 2', priority: Priority.High }),
//       ];

//       jest.spyOn(taskRepository, 'findBy').mockResolvedValue(tasks);

//       const result: TaskEntity[] = await service.findAll(userId);

//       expect(taskRepository.findBy).toHaveBeenCalledWith({ userId });
//       expect(result).toEqual(tasks);
//     });

//     it('should return an empty array for a user with no tasks', async () => {
//       const userId = 1;

//       jest.spyOn(taskRepository, 'findBy').mockResolvedValue([]);

//       const result: TaskEntity[] = await service.findAll(userId);

//       expect(taskRepository.findBy).toHaveBeenCalledWith({ userId });
//       expect(result).toEqual([]);
//     });
//   });

//   describe('findTasks', () => {
//     it('should return array of tasks(type Task)', async () => {
//       const userId = 1;

//       const tasks: TaskEntity[] = [
//         createTaskEntity({ id: 1, title: 'Task 1' }),
//         createTaskEntity({ id: 2, title: 'Task 2' }),
//       ];

//       jest.spyOn(taskRepository, 'find').mockResolvedValue(tasks);

//       const result: TaskEntity[] = await service.findTasks(userId);

//       expect(taskRepository.find).toHaveBeenCalledWith({
//         where: {
//           userId,
//           type: Type.Task,
//         },
//       });
//       expect(result).toEqual(tasks);
//     });

//     it('should return an empty array of tasks(type Task)', async () => {
//       const userId = 2;

//       jest.spyOn(taskRepository, 'find').mockResolvedValue([]);

//       const result: TaskEntity[] = await service.findTasks(userId);

//       expect(taskRepository.find).toHaveBeenCalledWith({
//         where: { userId, type: Type.Task },
//       });
//       expect(result).toEqual([]);
//     });
//   });

//   describe('findEvents', () => {
//     it('should return array of tasks(type Event)', async () => {
//       const userId = 1;

//       const events: TaskEntity[] = [
//         createTaskEntity({ id: 1, title: 'Task 1', type: Type.Event }),
//         createTaskEntity({ id: 2, title: 'Task 2', type: Type.Event }),
//       ];

//       jest.spyOn(taskRepository, 'find').mockResolvedValue(events);

//       const result: TaskEntity[] = await service.findEvents(userId);

//       expect(taskRepository.find).toHaveBeenCalledWith({
//         where: {
//           userId,
//           type: Type.Event,
//         },
//       });
//       expect(result).toEqual(events);
//     });

//     it('should return an empty array of tasks(type Event)', async () => {
//       const userId = 2;

//       jest.spyOn(taskRepository, 'find').mockResolvedValue([]);

//       const result: TaskEntity[] = await service.findEvents(userId);

//       expect(taskRepository.find).toHaveBeenCalledWith({
//         where: { userId, type: Type.Event },
//       });
//       expect(result).toEqual([]);
//     });
//   });

//   describe('update', () => {
//     const userId = 1;
//     const taskId = 1;
//     const updatePayload: UpdateTaskDto = {
//       title: 'Updated Title',
//       description: 'Updated Description',
//       priority: Priority.High,
//     };

//     it('should update an existing task and return the updated task', async () => {
//       const existingTask: TaskEntity = createTaskEntity({ id: taskId });

//       jest.spyOn(taskRepository, 'exist').mockResolvedValue(true);
//       jest.spyOn(taskRepository, 'update').mockResolvedValue({} as any);
//       jest.spyOn(service, 'findOne').mockResolvedValue(existingTask);

//       const result: TaskEntity = await service.update(
//         userId,
//         taskId,
//         updatePayload,
//       );

//       expect(taskRepository.exist).toHaveBeenCalledWith({
//         where: { userId, id: taskId },
//       });
//       expect(taskRepository.update).toHaveBeenCalledWith(taskId, updatePayload);
//       expect(service.findOne).toHaveBeenCalledWith(userId, taskId);
//       expect(result).toEqual(existingTask);
//     });

//     it('should not update a non-existing task', async () => {
//       jest.spyOn(taskRepository, 'exist').mockResolvedValue(false);

//       const result: TaskEntity = await service.update(
//         userId,
//         taskId,
//         updatePayload,
//       );

//       expect(taskRepository.exist).toHaveBeenCalledWith({
//         where: { userId, id: taskId },
//       });
//       expect(result).toBeUndefined();
//     });
//   });

//   describe('remove', () => {
//     const userId = 1;
//     const taskId = 1;

//     it('should remove  task and return the removed task', async () => {
//       const taskToRemove: TaskEntity = createTaskEntity({ id: taskId });

//       jest.spyOn(taskRepository, 'findOne').mockResolvedValue(taskToRemove);
//       jest.spyOn(taskRepository, 'remove').mockResolvedValue({} as any);

//       const result: TaskEntity = await service.remove(userId, taskId);

//       expect(taskRepository.findOne).toHaveBeenCalledWith({
//         where: { id: taskId, userId },
//       });
//       expect(taskRepository.remove).toHaveBeenCalledWith(taskToRemove);
//       expect(result).toEqual(taskToRemove);
//     });

//     it('should throw HttpException when task is not found', async () => {
//       jest.spyOn(taskRepository, 'findOne').mockResolvedValue(null);

//       await expect(service.remove(userId, taskId)).rejects.toThrowError(
//         new HttpException('Not Found', HttpStatus.NOT_FOUND),
//       );

//       expect(taskRepository.findOne).toHaveBeenCalledWith({
//         where: { id: taskId, userId },
//       });
//     });
//   });

//   describe('findOne', () => {
//     const userId = 1;
//     const taskId = 1;

//     it('should find and return the task when it exists', async () => {
//       const existingTask: TaskEntity = createTaskEntity({ id: taskId });

//       jest.spyOn(taskRepository, 'findOne').mockResolvedValue(existingTask);

//       const result: TaskEntity = await service.findOne(userId, taskId);

//       expect(taskRepository.findOne).toHaveBeenCalledWith({
//         where: { id: taskId, userId },
//       });
//       expect(result).toEqual(existingTask);
//     });

//     it('should throw HttpException when task is not found', async () => {
//       jest.spyOn(taskRepository, 'findOne').mockResolvedValue(null);

//       await expect(service.findOne(userId, taskId)).rejects.toThrowError(
//         new HttpException('Not Found', HttpStatus.NOT_FOUND),
//       );

//       expect(taskRepository.findOne).toHaveBeenCalledWith({
//         where: { id: taskId, userId },
//       });
//     });
//   });

//   describe('create', () => {
//     it('should create and return a new task for the user', async () => {
//       // Arrange
//       const newTask: TaskEntity = createTaskEntity({
//         ...createTaskDto(),
//       });

//       newTask.user = new UserEntity();

//       jest.spyOn(taskRepository, 'save').mockResolvedValue(newTask);

//       const result = await service.create(user, createTaskDto());

//       expect(taskRepository.save).toHaveBeenCalledWith(expect.any(TaskEntity));
//       expect(result).toEqual(
//         expect.objectContaining({
//           category: newTask.category,
//           pinned: newTask.pinned,
//           priority: newTask.priority,
//           subCategory: newTask.subCategory,
//           title: newTask.title,
//           type: newTask.type,
//         }),
//       );
//     });
//   });
// });
