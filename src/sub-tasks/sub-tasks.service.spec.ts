// import { HttpException, HttpStatus } from '@nestjs/common';
// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { DeepPartial, Repository } from 'typeorm';

// import { TaskEntity } from '@/tasks/entities/task.entity';
// import { Priority, TaskCategories, Type } from '@/tasks/enums/enums';
// import { TasksService } from '@/tasks/tasks.service';
// import { UserEntity } from '@/users/entities/user.entity';

// import { CreateSubTaskDto } from './dto/create-sub-task.dto';
// import { UpdateSubTaskDto } from './dto/update-sub-task.dto';
// import { SubTaskEntity } from './entities/sub-task.entity';
// import { SubTasksService } from './sub-tasks.service';

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
//   user: new UserEntity(),
//   subTasks: [],
//   ...overrides,
// });

// const createSubTaskEntity = (
//   overrides?: Partial<SubTaskEntity>,
// ): SubTaskEntity => ({
//   id: 1,
//   title: 'default title',
//   description: 'string',
//   createDate: new Date(),
//   completeDate: null,
//   taskId: 2,
//   ...overrides,
// });

// const createSubTaskDto = (): CreateSubTaskDto => ({
//   taskId: 1,
//   title: 'title',
//   description: 'string',
// });

// const user = {
//   id: 2,
//   name: 'user',
// };

// describe('SubTasksService', () => {
//   let subTasksService: SubTasksService;
//   let tasksService: TasksService;
//   let subTaskRepository: Repository<SubTaskEntity>;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         SubTasksService,
//         TasksService,
//         {
//           provide: getRepositoryToken(SubTaskEntity),
//           useClass: Repository,
//         },
//         {
//           provide: getRepositoryToken(TaskEntity),
//           useClass: Repository,
//         },
//       ],
//     }).compile();

//     subTasksService = module.get<SubTasksService>(SubTasksService);
//     tasksService = module.get<TasksService>(TasksService);
//     subTaskRepository = module.get<Repository<SubTaskEntity>>(
//       getRepositoryToken(SubTaskEntity),
//     );
//   });

//   it('should be defined', () => {
//     expect(subTasksService).toBeDefined();
//   });

//   describe('taskExist', () => {
//     it('should call tasksService.findOne with correct params', async () => {
//       const existingTask = createTaskEntity();

//       const findOneSpy = jest
//         .spyOn(tasksService, 'findOne')
//         .mockResolvedValue(existingTask);

//       await subTasksService.taskExist(user.id, existingTask.id);

//       expect(findOneSpy).toHaveBeenCalledWith(user.id, existingTask.id);
//     });
//   });

//   describe('getAll', () => {
//     it('should call tasksService.findOne with correct params and return subTasks', async () => {
//       const subTasks = [createSubTaskEntity(), createSubTaskEntity()];
//       const existingTask = createTaskEntity({
//         user: new UserEntity(),
//         subTasks,
//       });

//       const findOneSpy = jest
//         .spyOn(tasksService, 'findOne')
//         .mockResolvedValue(existingTask);

//       const result: SubTaskEntity[] = await subTasksService.getAll(
//         user.id,
//         existingTask.id,
//       );

//       expect(findOneSpy).toHaveBeenCalledWith(user.id, existingTask.id);
//       expect(result).toEqual(subTasks);
//     });
//   });

//   describe('getOne', () => {
//     it('should call taskExist and findOne with correct params, ad return subTask', async () => {
//       const existingTask = createTaskEntity();
//       const existingSubTask = createSubTaskEntity({
//         taskId: existingTask.id,
//       });

//       const taskExistSpy = jest
//         .spyOn(subTasksService, 'taskExist')
//         .mockResolvedValueOnce();

//       const findOneSpy = jest
//         .spyOn(subTaskRepository, 'findOne')
//         .mockResolvedValue(existingSubTask);

//       const result: SubTaskEntity = await subTasksService.getOne(
//         user.id,
//         existingTask.id,
//         existingSubTask.id,
//       );

//       expect(taskExistSpy).toHaveBeenCalledWith(user.id, existingTask.id);
//       expect(findOneSpy).toHaveBeenCalledWith({
//         where: { taskId: existingTask.id, id: existingSubTask.id },
//       });
//       expect(result).toEqual(existingSubTask);
//     });
//   });

//   describe('createOne', () => {
//     it('should call taskExist, save, and return the created subTask', async () => {
//       const payload: CreateSubTaskDto = createSubTaskDto();

//       const taskExistSpy = jest
//         .spyOn(subTasksService, 'taskExist')
//         .mockResolvedValueOnce();

//       const saveSpy = jest
//         .spyOn(subTaskRepository, 'save')
//         .mockImplementation(
//           async (newSubTask: DeepPartial<SubTaskEntity>) =>
//             newSubTask as SubTaskEntity,
//         );

//       const result = await subTasksService.createOne(user.id, payload);

//       expect(taskExistSpy).toHaveBeenCalledWith(user.id, payload.taskId);
//       expect(saveSpy).toHaveBeenCalledWith(expect.any(SubTaskEntity));
//       expect(result).toEqual(expect.any(SubTaskEntity));
//     });
//   });

//   describe('deleteOne', () => {
//     it('should call taskExist, findOne, remove, and delete the subTask', async () => {
//       const existingTask = createTaskEntity();
//       const existingSubTask = createSubTaskEntity({
//         taskId: existingTask.id,
//       });

//       const taskExistSpy = jest
//         .spyOn(subTasksService, 'taskExist')
//         .mockResolvedValueOnce();

//       const findOneSpy = jest
//         .spyOn(subTaskRepository, 'findOne')
//         .mockResolvedValueOnce(existingSubTask);

//       const removeSpy = jest
//         .spyOn(subTaskRepository, 'remove')
//         .mockResolvedValueOnce({ affected: 1 } as any);

//       await subTasksService.deleteOne(
//         user.id,
//         existingTask.id,
//         existingSubTask.id,
//       );

//       expect(taskExistSpy).toHaveBeenCalledWith(user.id, existingTask.id);
//       expect(findOneSpy).toHaveBeenCalledWith({
//         where: { taskId: existingTask.id, id: existingSubTask.id },
//       });
//       expect(removeSpy).toHaveBeenCalledWith(existingSubTask);
//     });
//   });

//   describe('updateOne', () => {
//     it('should call getOne, update subTask, and return the updated subTask', async () => {
//       const payload: UpdateSubTaskDto = {
//         id: 1,
//         taskId: 1,
//         title: 'Updated Title',
//         description: 'Updated Description',
//       };

//       const getOneSpy = jest
//         .spyOn(subTasksService, 'getOne')
//         .mockResolvedValueOnce(createSubTaskEntity());

//       const saveSpy = jest
//         .spyOn(subTaskRepository, 'save')
//         .mockImplementation(
//           async (updatedSubTask: DeepPartial<SubTaskEntity>) =>
//             updatedSubTask as SubTaskEntity,
//         );

//       const result = await subTasksService.updateOne(user.id, payload);

//       expect(getOneSpy).toHaveBeenCalledWith(
//         user.id,
//         payload.taskId,
//         payload.id,
//       );

//       expect(result.title).toEqual(payload.title);
//       expect(result.description).toEqual(payload.description);

//       expect(saveSpy).toHaveBeenCalledWith(result);
//     });
//   });

//   describe('completeOne', () => {
//     it('should call getOne, complete subTask, and return the completed subTask', async () => {
//       const taskId = 1;
//       const subTaskId = 1;

//       const getOneSpy = jest
//         .spyOn(subTasksService, 'getOne')
//         .mockResolvedValueOnce(createSubTaskEntity());

//       const saveSpy = jest
//         .spyOn(subTaskRepository, 'save')
//         .mockImplementation(
//           async (completedSubTask: DeepPartial<SubTaskEntity>) =>
//             completedSubTask as SubTaskEntity,
//         );

//       const result = await subTasksService.completeOne(
//         user.id,
//         taskId,
//         subTaskId,
//       );

//       expect(getOneSpy).toHaveBeenCalledWith(user.id, taskId, subTaskId);
//       expect(result.completeDate).toBeDefined();
//       expect(saveSpy).toHaveBeenCalledWith(result);
//     });

//     it('should throw BadRequestException when subTask is already completed', async () => {
//       const taskId = 1;
//       const subTaskId = 1;

//       jest
//         .spyOn(subTasksService, 'getOne')
//         .mockResolvedValueOnce(
//           createSubTaskEntity({ completeDate: new Date() }),
//         );

//       await expect(
//         subTasksService.completeOne(user.id, taskId, subTaskId),
//       ).rejects.toThrowError(
//         new HttpException('Already completed', HttpStatus.BAD_REQUEST),
//       );
//     });
//   });

//   it('should call getOne, complete subTask, and return the completed subTask', async () => {
//     const taskId = 1;
//     const subTaskId = 1;

//     const getOneSpy = jest
//       .spyOn(subTasksService, 'getOne')
//       .mockResolvedValueOnce(createSubTaskEntity({ completeDate: null }));

//     const saveSpy = jest
//       .spyOn(subTaskRepository, 'save')
//       .mockImplementation(
//         async (completedSubTask: DeepPartial<SubTaskEntity>) =>
//           completedSubTask as SubTaskEntity,
//       );

//     const result = await subTasksService.completeOne(
//       user.id,
//       taskId,
//       subTaskId,
//     );

//     expect(getOneSpy).toHaveBeenCalledWith(user.id, taskId, subTaskId);

//     expect(result.completeDate).toBeDefined();

//     expect(saveSpy).toHaveBeenCalledWith(result);
//   });

//   it('should throw BadRequestException when subTask is already completed', async () => {
//     const taskId = 1;
//     const subTaskId = 1;

//     jest
//       .spyOn(subTasksService, 'getOne')
//       .mockResolvedValueOnce(createSubTaskEntity({ completeDate: new Date() }));

//     await expect(
//       subTasksService.completeOne(user.id, taskId, subTaskId),
//     ).rejects.toThrowError(
//       new HttpException('Already completed', HttpStatus.BAD_REQUEST),
//     );
//   });
// });
