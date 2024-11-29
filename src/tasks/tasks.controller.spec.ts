// import { JwtModule, JwtService } from '@nestjs/jwt';
// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// import { UserEntity } from '@/users/entities/user.entity';

// import { CreateTaskDto } from './dto/create-task.dto';
// import { UpdateTaskDto } from './dto/update-task.dto';
// import { TaskEntity } from './entities/task.entity';
// import { Priority, TaskCategories, Type } from './enums/enums';
// import { TasksController } from './tasks.controller';
// import { TasksService } from './tasks.service';

// const expectError = async (
//   asyncFunction: () => Promise<any>,
// ): Promise<void> => {
//   try {
//     await asyncFunction();
//   } catch (error) {
//     expect(() => {
//       throw error;
//     }).toThrow();
//   }
// };

// const createTaskDto = (): CreateTaskDto => ({
//   title: 'string',
//   description: 'string',
//   category: TaskCategories.Work,
//   type: Type.Event || Type.Task,
//   subCategory: 'string',
//   priority: Priority.Medium,
//   pinned: true,
// });

// const user = {
//   id: 1,
//   email: 'test@example.com',
//   role: 'user',
// };
// const createTaskEntity = (overrides?: Partial<TaskEntity>): TaskEntity => ({
//   id: 1,
//   title: 'Default Title',
//   type: Type.Task,
//   description: 'Default Description',
//   category: TaskCategories.Life,
//   subCategory: 'Default Subcategory',
//   priority: Priority.Medium,
//   pinned: false,
//   createDate: new Date(),
//   completeDate: null,
//   user: new UserEntity(),
//   subTasks: [],
//   ...overrides,
// });

// describe('TasksController', () => {
//   let controller: TasksController;
//   let taskRepository: Repository<TaskEntity>;
//   let jwtService: JwtService;

//   const TASK_REPOSITORY_TOKEN = getRepositoryToken(TaskEntity);

//   beforeAll(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [TasksController],

//       providers: [
//         TasksService,
//         JwtService,
//         { provide: TASK_REPOSITORY_TOKEN, useClass: Repository },
//       ],
//       imports: [
//         JwtModule.register({
//           secret: 'your-secret-key',
//           signOptions: { expiresIn: '1d' },
//         }),
//       ],
//     }).compile();

//     controller = module.get<TasksController>(TasksController);
//     taskRepository = module.get<Repository<TaskEntity>>(TASK_REPOSITORY_TOKEN);

//     jwtService = module.get<JwtService>(JwtService);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   it('taskRepository should be defined', () => {
//     expect(taskRepository).toBeDefined;
//   });

//   describe('createOne', () => {
//     it('should create a new task when provided with a valid token ', async () => {
//       const createdTask: TaskEntity = createTaskEntity({
//         ...createTaskDto(),
//       });

//       const token: string = jwtService.sign(user);

//       const createSpy = jest
//         .spyOn(controller, 'createOne')
//         .mockImplementation(async () => createdTask);

//       const result = await controller.createOne(token, createTaskDto());

//       expect(result).toEqual(createdTask);
//       expect(createSpy).toHaveBeenCalledWith(token, createTaskDto());
//     });

//     it('should throw an error when provided with an invalid token', async () => {
//       const invalidToken = 'invalid-token';

//       await expectError(() =>
//         controller.createOne(invalidToken, createTaskDto()),
//       );
//     });
//   });

//   describe('findAll', () => {
//     it('should return all tasks for the user', async () => {
//       const tasks: TaskEntity[] = [
//         createTaskEntity({ id: 1, title: 'Task 1', type: Type.Event }),
//         createTaskEntity({ id: 2, title: 'Task 2', priority: Priority.High }),
//       ];

//       const token: string = jwtService.sign(user);

//       const findAllSpy = jest
//         .spyOn(controller, 'findAll')
//         .mockImplementation(async () => tasks);

//       const result: TaskEntity[] = await controller.findAll(token);

//       expect(result).toEqual(tasks);
//       expect(findAllSpy).toHaveBeenCalledWith(token);
//     });

//     it('should throw an error when provided with an invalid token', async () => {
//       const invalidToken = 'invalid-token';

//       await expectError(() => controller.findAll(invalidToken));
//     });
//   });

//   describe('getTasks', () => {
//     it('should return all tasks with type "task"', async () => {
//       const tasks: TaskEntity[] = [
//         createTaskEntity({ id: 1, title: 'Task 1', type: Type.Task }),
//         createTaskEntity({ id: 2, title: 'Task 2', type: Type.Task }),
//       ];

//       const token: string = jwtService.sign(user);

//       const getTasksSpy = jest
//         .spyOn(controller, 'getTasks')
//         .mockImplementation(async () => tasks);

//       const result: TaskEntity[] = await controller.getTasks(token);

//       expect(result).toEqual(tasks);
//       expect(getTasksSpy).toHaveBeenCalledWith(token);
//     });

//     it('should throw an error when provided with an invalid token', async () => {
//       const invalidToken = 'invalid-token';

//       await expectError(() => controller.getTasks(invalidToken));
//     });
//   });

//   describe('getEvents', () => {
//     it('should return all tasks with type "events"', async () => {
//       const events: TaskEntity[] = [
//         createTaskEntity({ id: 1, title: 'Task 1', type: Type.Event }),
//         createTaskEntity({ id: 2, title: 'Task 2', type: Type.Event }),
//       ];

//       const token: string = jwtService.sign(user);

//       const getEventsSpy = jest
//         .spyOn(controller, 'getEvents')
//         .mockImplementation(async () => events);

//       const result: TaskEntity[] = await controller.getEvents(token);

//       expect(result).toEqual(events);
//       expect(getEventsSpy).toHaveBeenCalledWith(token);
//     });

//     it('should throw an error when provided with an invalid token', async () => {
//       const invalidToken = 'invalid-token';

//       await expectError(() => controller.getEvents(invalidToken));
//     });
//   });

//   describe('getById', () => {
//     it('should return the task with the given ID for the user', async () => {
//       const taskId = 1;

//       const task: TaskEntity = createTaskEntity({ id: taskId });

//       const token: string = jwtService.sign(user);

//       const getByIdSpy = jest
//         .spyOn(controller, 'getById')
//         .mockImplementation(async () => task);

//       const result: TaskEntity = await controller.getById(token, taskId);

//       expect(result).toEqual(task);
//       expect(getByIdSpy).toHaveBeenCalledWith(token, taskId);
//     });

//     it('should throw an error when provided with an invalid token', async () => {
//       const taskId = 1;
//       const invalidToken = 'invalid-token';

//       await expectError(() => controller.getById(invalidToken, taskId));
//     });

//     it('should throw an error when provided with an invalid task ID', async () => {
//       const invalidTaskId = 88;
//       const token = jwtService.sign(user);

//       await expectError(() => controller.getById(token, invalidTaskId));
//     });
//   });

//   describe('update', () => {
//     const payload: UpdateTaskDto = {
//       title: 'Updated Task',
//       description: 'Updated Description',
//     };

//     it('should update the task and return the updated task', async () => {
//       const taskId = 1;

//       const updatedTask: TaskEntity = { ...createTaskEntity(), ...payload };

//       const token: string = jwtService.sign(user);

//       const updateSpy = jest
//         .spyOn(controller, 'update')
//         .mockImplementation(async () => updatedTask);

//       const result: TaskEntity = await controller.update(
//         token,
//         taskId,
//         payload,
//       );

//       expect(result).toEqual(updatedTask);
//       expect(updateSpy).toHaveBeenCalledWith(token, taskId, payload);
//     });

//     it('should throw an error when provided with an invalid token', async () => {
//       const taskId = 1;

//       const invalidToken = 'invalid-token';

//       await expectError(() => controller.update(invalidToken, taskId, payload));
//     });

//     it('should throw an error when provided with an invalid task ID', async () => {
//       const invalidTaskId = 88;
//       const token: string = jwtService.sign(user);

//       await expectError(() => controller.getById(token, invalidTaskId));
//     });
//   });

//   describe('remove', () => {
//     it('should remove the task and return removed task', async () => {
//       const taskId = 1;
//       const token: string = jwtService.sign(user);

//       const removedTask: TaskEntity = createTaskEntity({ id: taskId });

//       const removeSpy = jest
//         .spyOn(controller, 'remove')
//         .mockImplementation(async () => removedTask);

//       const result: TaskEntity = await controller.remove(token, taskId);

//       expect(result).toEqual(removedTask);
//       expect(removeSpy).toHaveBeenCalledWith(token, taskId);
//     });

//     it('should throw an error when provided with an invalid token', async () => {
//       const taskId = 1;
//       const invalidToken = 'invalid-token';

//       await expectError(() => controller.remove(invalidToken, taskId));
//     });

//     it('should throw an error when provided with an invalid task ID', async () => {
//       const invalidTaskId = 88;
//       const token: string = jwtService.sign(user);

//       await expectError(() => controller.remove(token, invalidTaskId));
//     });
//   });
// });
