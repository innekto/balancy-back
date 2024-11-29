// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { DeleteResult, Repository } from 'typeorm';

// import { UserEntity } from '@/users/entities/user.entity';

// import { CreateTagDto } from './dto/create-tag.dto';
// import { UpdateTagDto } from './dto/update-tag.dto';
// import { TagEntity } from './entities/tag.entity';
// import { TagsController } from './tags.controller';
// import { TagsService } from './tags.service';

// const user = {
//   id: 1,
//   email: 'test@example.com',
//   role: 'user',
// };

// const createTagEntity = (overrides?: Partial<TagEntity>): TagEntity => ({
//   id: 1,
//   name: 'Default Tag Name',
//   user: new UserEntity(),
//   ...overrides,
// });

// const createTagDto = (): CreateTagDto => ({
//   name: 'string',
// });

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

// describe('SubCategoriesController', () => {
//   let controller: TagsController;
//   // let tagsService: TagsService;

//   let tagRepository: Repository<TagEntity>;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [TagsController],
//       providers: [
//         TagsService,
//         { provide: getRepositoryToken(TagEntity), useClass: Repository },
//         { provide: getRepositoryToken(UserEntity), useClass: Repository },
//       ],
//     }).compile();

//     controller = module.get<TagsController>(TagsController);
//     // tagsService = module.get<TagsService>(TagsService);

//     tagRepository = module.get<Repository<TagEntity>>(
//       getRepositoryToken(TagEntity),
//     );
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   it('tagRepository should be defined', () => {
//     expect(tagRepository).toBeDefined;
//   });

//   describe('getAll', () => {
//     it('should return all tags for the user', async () => {
//       const expectedTags: TagEntity[] = [
//         createTagEntity(createTagDto()),
//         createTagEntity({ ...createTagDto(), id: 2, name: 'Tag 2' }),
//       ];

//       const getAllSpy = jest
//         .spyOn(controller, 'getAll')
//         .mockResolvedValue(expectedTags);

//       const result: TagEntity[] = await controller.getAll(user.id);

//       expect(result).toEqual(expectedTags);
//       expect(getAllSpy).toHaveBeenLastCalledWith(user.id);
//     });

//     it('should throw an error when provided with an invalid user id', async () => {
//       const invaliduserId = 5;

//       await expect(controller.getAll(invaliduserId)).rejects.toThrowError();
//     });
//   });

//   describe('getById', () => {
//     it('should return the tag with the given ID ', async () => {
//       const tagId = 2;

//       const tag: TagEntity = createTagEntity({ id: tagId });

//       const geByIdSpy = jest
//         .spyOn(controller, 'getById')
//         .mockResolvedValue(tag);

//       const result: TagEntity = await controller.getById(user.id, tagId);

//       expect(result).toEqual(tag);
//       expect(geByIdSpy).toHaveBeenCalledWith(user.id, tagId);
//     });

//     it('should throw an error when provided with an invalid tag ID', async () => {
//       const invalidTagId = 88;

//       await expectError(() => controller.getById(user.id, invalidTagId));
//     });

//     it('should throw an error when provided with an invalid user id', async () => {
//       const tagId = 2;
//       const invalidUserId = 5;

//       await expectError(() => controller.getById(invalidUserId, tagId));
//     });
//   });

//   describe('create', () => {
//     it('should create a new tag when provided with a valid user id', async () => {
//       const createdTag: TagEntity = createTagEntity({
//         ...createTagDto(),
//       });

//       const createSpy = jest
//         .spyOn(controller, 'create')
//         .mockResolvedValue(createdTag);

//       const result = await controller.create(user.id, createTagDto());

//       expect(result).toEqual(createdTag);
//       expect(createSpy).toHaveBeenCalledWith(user.id, createTagDto());
//     });

//     it('should throw an error when provided with an invalid user id', async () => {
//       const invalidUserId = 5;

//       await expectError(() => controller.create(invalidUserId, createTagDto()));
//     });
//   });

//   describe('upadte', () => {
//     const payload: UpdateTagDto = {
//       name: 'home',
//     };

//     const tagId = 2;

//     it('should upadte tag and return updated tag', async () => {
//       const updatedTag: TagEntity = { ...createTagEntity(), ...payload };

//       const updateSpy = jest
//         .spyOn(controller, 'update')
//         .mockResolvedValue(updatedTag);

//       const result = await controller.update(user.id, tagId, payload);

//       expect(result).toEqual(updatedTag);
//       expect(updateSpy).toHaveBeenCalledWith(user.id, tagId, payload);
//     });

//     it('should throw an error when provided with an invalid user id', async () => {
//       const invalidUserId = 5;

//       await expectError(() => controller.update(invalidUserId, tagId, payload));
//     });

//     it('should throw an error when provided with an invalid tag id', async () => {
//       const invalidTagId = 5;

//       await expectError(() =>
//         controller.update(user.id, invalidTagId, payload),
//       );
//     });

//     it('should throw an error when provided with an invalid payload', async () => {
//       const invalidPayload = {
//         name: '',
//       };

//       await expectError(() =>
//         controller.update(user.id, tagId, invalidPayload),
//       );
//     });
//   });

//   describe('delete', () => {
//     const tagId = 1;
//     it('should delete the tag', async () => {
//       const deleteSpy = jest
//         .spyOn(controller, 'delete')
//         .mockResolvedValue({ raw: [], affected: 1 } as DeleteResult);

//       const result = await controller.delete(user.id, tagId);

//       expect(result).toEqual({ raw: [], affected: 1 } as DeleteResult);
//       expect(deleteSpy).toHaveBeenCalledWith(user.id, tagId);
//     });

//     it('should throw an error when provided with an invalid user id', async () => {
//       const invalidUserId = 5;

//       await expectError(() => controller.delete(invalidUserId, tagId));
//     });

//     it('should throw an error when provided with an invalid tag id', async () => {
//       const invalidTagId = 88;

//       await expectError(() => controller.delete(user.id, invalidTagId));
//     });
//   });
// });
