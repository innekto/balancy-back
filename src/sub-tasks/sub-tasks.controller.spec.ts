// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// import { TaskEntity } from '@/tasks/entities/task.entity';
// import { TasksService } from '@/tasks/tasks.service';

// import { CreateSubTaskDto } from './dto/create-sub-task.dto';
// import { UpdateSubTaskDto } from './dto/update-sub-task.dto';
// import { SubTaskEntity } from './entities/sub-task.entity';
// import { SubTasksController } from './sub-tasks.controller';
// import { SubTasksService } from './sub-tasks.service';

// const createSubTaskDto = (): CreateSubTaskDto => ({
//   taskId: 1,
//   title: 'string',
//   description: 'string',
// });

// const createSubTaskEntity = (
//   overrides?: Partial<SubTaskEntity>,
// ): SubTaskEntity => ({
//   id: 1,
//   title: 'Default Title',
//   description: 'Default Description',
//   createDate: new Date(),
//   completeDate: null,
//   taskId: 1,
//   ...overrides,
// });

// describe('SubTasksController', () => {
//   let controller: SubTasksController;
//   let service: SubTasksService;

//   const SUB_TASKS_REPOSITORY_TOKEN = getRepositoryToken(SubTaskEntity);
//   const TASK_REPOSITORY_TOKEN = getRepositoryToken(TaskEntity);

//   const user = {
//     id: 1,
//     email: 'test@example.com',
//     role: 'user',
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [SubTasksController],
//       providers: [
//         TasksService,
//         SubTasksService,
//         { provide: SUB_TASKS_REPOSITORY_TOKEN, useClass: Repository },
//         { provide: TASK_REPOSITORY_TOKEN, useClass: Repository },
//       ],
//     }).compile();

//     controller = module.get<SubTasksController>(SubTasksController);
//     service = module.get<SubTasksService>(SubTasksService);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   describe('createOne', () => {
//     it('should create a new sub task when provided with a valid user', async () => {
//       const payload = createSubTaskDto();
//       const createdSubTask: SubTaskEntity = createSubTaskEntity({ ...payload });

//       jest.spyOn(service, 'createOne').mockResolvedValue(createdSubTask);

//       const result = await controller.createOne(user.id, payload);

//       expect(result).toEqual(createdSubTask);
//       expect(service.createOne).toHaveBeenCalledWith(user.id, payload);
//     });
//   });

//   describe('getAll', () => {
//     it('should get all subtasks for a given user and task ID', async () => {
//       const taskId = 1;
//       const subTasks: SubTaskEntity[] = [
//         createSubTaskEntity(createSubTaskDto()),
//         createSubTaskEntity({ id: 2, title: 'newTitle' }),
//       ];

//       jest.spyOn(service, 'getAll').mockResolvedValue(subTasks);

//       const result = await controller.getAll(user.id, taskId);

//       expect(result).toEqual(subTasks);
//       expect(service.getAll).toHaveBeenCalledWith(user.id, taskId);
//     });
//   });

//   describe('getOne', () => {
//     it('should get a single subtask for a given user, task ID, and subtask ID', async () => {
//       const taskId = 1;
//       const subTaskId = 2;
//       const sexistSubTask = createSubTaskEntity({ id: subTaskId, taskId });

//       jest.spyOn(service, 'getOne').mockResolvedValue(sexistSubTask);

//       const result = await controller.getOne(user.id, taskId, subTaskId);

//       expect(result).toEqual(sexistSubTask);
//       expect(service.getOne).toHaveBeenCalledWith(user.id, taskId, subTaskId);
//     });
//   });

//   describe('updateOne', () => {
//     it('should update a single subtask for a given user and payload', async () => {
//       const payload: UpdateSubTaskDto = { id: 1, title: 'Updated Title' };
//       const updatedSubTask: SubTaskEntity = createSubTaskEntity({ ...payload });

//       jest.spyOn(service, 'updateOne').mockResolvedValue(updatedSubTask);

//       const result = await controller.updateOne(user.id, payload);

//       expect(result).toEqual(updatedSubTask);
//       expect(service.updateOne).toHaveBeenCalledWith(user.id, payload);
//     });
//   });

//   describe('deleteOne', () => {
//     it('should delete a single subtask for a given user, task ID, and subtask ID', async () => {
//       const taskId = 1;
//       const subTaskId = 2;

//       jest.spyOn(service, 'deleteOne').mockResolvedValue();

//       const result = await controller.deleteOne(user.id, taskId, subTaskId);

//       expect(result).toBeUndefined();
//       expect(service.deleteOne).toHaveBeenCalledWith(
//         user.id,
//         taskId,
//         subTaskId,
//       );
//     });
//   });

//   describe('completeOne', () => {
//     it('should complete a single subtask for a given user, task ID, and subtask ID', async () => {
//       const taskId = 1;
//       const subTaskId = 2;
//       const completedSubTask: SubTaskEntity = createSubTaskEntity({
//         id: subTaskId,
//         taskId: taskId,
//         completeDate: new Date(),
//       });

//       jest.spyOn(service, 'completeOne').mockResolvedValue(completedSubTask);

//       const result = await controller.completeOne(user.id, taskId, subTaskId);

//       expect(result).toEqual(completedSubTask);
//       expect(service.completeOne).toHaveBeenCalledWith(
//         user.id,
//         taskId,
//         subTaskId,
//       );
//     });
//   });

//   describe('incompleteOne', () => {
//     it('should mark a single subtask as incomplete for a given user, task ID, and subtask ID', async () => {
//       const taskId = 1;
//       const subTaskId = 2;
//       const incompleteSubTask: SubTaskEntity = createSubTaskEntity({
//         id: subTaskId,
//         taskId: taskId,
//       });

//       jest.spyOn(service, 'incompleteOne').mockResolvedValue(incompleteSubTask);

//       const result = await controller.incompleteOne(user.id, taskId, subTaskId);

//       expect(result).toEqual(incompleteSubTask);
//       expect(service.incompleteOne).toHaveBeenCalledWith(
//         user.id,
//         taskId,
//         subTaskId,
//       );
//     });
//   });
// });
