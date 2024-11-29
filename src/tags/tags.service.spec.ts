// import { HttpException, HttpStatus } from '@nestjs/common';
// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// import { UserEntity } from '@/users/entities/user.entity';

// import { CreateTagDto } from './dto/create-tag.dto';
// import { UpdateTagDto } from './dto/update-tag.dto';
// import { TagEntity } from './entities/tag.entity';
// import { TagsService } from './tags.service';

// const user = new UserEntity();

// const createTagEntity = (overrides?: Partial<TagEntity>): TagEntity => ({
//   id: 1,
//   name: 'string',
//   user,
//   ...overrides,
// });

// const createTagDto = (): CreateTagDto => ({ name: 'sport' });

// describe('TagsService', () => {
//   let service: TagsService;
//   let tagRepository: Repository<TagEntity>;
//   // let userRepository: Repository<UserEntity>;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         TagsService,
//         { provide: getRepositoryToken(TagEntity), useClass: Repository },
//         { provide: getRepositoryToken(UserEntity), useClass: Repository },
//       ],
//     }).compile();

//     service = module.get<TagsService>(TagsService);
//     tagRepository = module.get<Repository<TagEntity>>(
//       getRepositoryToken(TagEntity),
//     );
//     // userRepository = module.get<Repository<UserEntity>>(
//     //   getRepositoryToken(UserEntity),
//     // );
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('findAll', () => {
//     it('should return tags for a valid user', async () => {
//       const userId = 2;
//       const tag: TagEntity[] = [
//         createTagEntity(),
//         createTagEntity({ id: 2, name: 'work' }),
//       ];

//       jest.spyOn(tagRepository, 'findBy').mockResolvedValue(tag);

//       const result: TagEntity[] = await service.findAll(userId);

//       expect(tagRepository.findBy).toHaveBeenCalledWith({ userId });
//       expect(result).toEqual(tag);
//     });

//     it('should return an empty array when no tags are found for a valid user', async () => {
//       const userId = 2;

//       jest.spyOn(tagRepository, 'findBy').mockResolvedValue([]);

//       const result: TagEntity[] = await service.findAll(userId);

//       expect(tagRepository.findBy).toHaveBeenCalledWith({ userId });
//       expect(result).toEqual([]);
//     });
//   });

//   describe('findById', () => {
//     it('should return the tag when found for a valid user', async () => {
//       const userId = 2;
//       const tagId = 2;
//       const tag: TagEntity = createTagEntity({ id: tagId });

//       jest.spyOn(tagRepository, 'findOneBy').mockResolvedValue(tag);

//       const result: TagEntity = await service.findById(userId, tagId);

//       expect(tagRepository.findOneBy).toHaveBeenCalledWith({
//         userId,
//         id: tagId,
//       });
//       expect(result).toEqual(tag);
//     });

//     it('should throw HttpException when tag is not found for a valid user', async () => {
//       const userId = 2;
//       const tagId = 1;

//       jest.spyOn(tagRepository, 'findOneBy').mockResolvedValue(null);

//       expect(service.findById(userId, tagId)).rejects.toThrowError(
//         new HttpException('Tag not found', HttpStatus.NOT_FOUND),
//       );
//       expect(tagRepository.findOneBy).toHaveBeenCalledWith({
//         userId,
//         id: tagId,
//       });
//     });
//   });

//   describe('create', () => {
//     it('should create and return a new tag when tag does not exist', async () => {
//       const userId = 1;
//       const createTagDtoData = createTagDto();
//       const newTag: TagEntity = createTagEntity(createTagDtoData);
//       const existServiceMock = jest.fn();

//       service['exist'] = existServiceMock;

//       existServiceMock.mockResolvedValue(null);

//       jest.spyOn(tagRepository, 'save').mockResolvedValue(newTag);

//       const result = await service.create(user, createTagDtoData);

//       expect(existServiceMock).toHaveBeenCalledWith(
//         userId,
//         createTagDtoData.name,
//       );
//       expect(tagRepository.save).toHaveBeenCalledWith(expect.any(TagEntity));
//       expect(result).toEqual(createTagDtoData);
//     });

//     it('should throw HttpException when tag already exists for a user', async () => {
//       const createTagDtoData = createTagDto();
//       const existServiceMock = jest.fn();

//       service['exist'] = existServiceMock;

//       const existingTag: TagEntity = createTagEntity(createTagDtoData);
//       existServiceMock.mockResolvedValue(existingTag);

//       await expect(service.create(user, createTagDtoData)).rejects.toThrowError(
//         new HttpException('Tag already exists', HttpStatus.CONFLICT),
//       );
//     });
//   });

//   describe('update', () => {
//     it('should update and return the updated tag', async () => {
//       const userId = 1;
//       const tagId = 1;
//       const updateTagDtoData: UpdateTagDto = { name: 'life' };
//       const updatedTag: TagEntity = createTagEntity({
//         id: tagId,
//         name: updateTagDtoData.name,
//       });

//       jest
//         .spyOn(service, 'findById')
//         .mockResolvedValue(createTagEntity({ id: tagId }));

//       jest.spyOn(tagRepository, 'save').mockResolvedValue(updatedTag);

//       const result = await service.update(userId, tagId, updateTagDtoData);

//       expect(service.findById).toHaveBeenCalledWith(userId, tagId);
//       expect(tagRepository.save).toHaveBeenCalledWith(updatedTag);
//       expect(result).toEqual(updatedTag);
//     });

//     it('should throw HttpException when tag is not found', async () => {
//       const userId = 1;
//       const tagId = 1;
//       const updateTagDtoData: UpdateTagDto = { name: 'updatedName' };

//       jest
//         .spyOn(service, 'findById')
//         .mockRejectedValue(
//           new HttpException('Tag not found', HttpStatus.NOT_FOUND),
//         );

//       await expect(async () => {
//         await service.update(userId, tagId, updateTagDtoData);
//       }).rejects.toThrowError(
//         new HttpException('Tag not found', HttpStatus.NOT_FOUND),
//       );
//     });
//   });

//   describe('delete', () => {
//     it('should delete tag when found', async () => {
//       const userId = 1;
//       const tagId = 1;
//       const tag = createTagEntity({ id: tagId });

//       jest.spyOn(service, 'findById').mockResolvedValue(tag);

//       jest
//         .spyOn(tagRepository, 'delete')
//         .mockImplementation(() => Promise.resolve({ raw: [], affected: 1 }));

//       const result = await service.delete(userId, tagId);

//       expect(service.findById).toHaveBeenCalledWith(userId, tagId);
//       expect(tagRepository.delete).toHaveBeenCalledWith(tag);
//       expect(result).toEqual({ raw: [], affected: 1 });
//     });

//     it('should throw HttpException when tag is not found', async () => {
//       const userId = 1;
//       const tagId = 1;

//       jest
//         .spyOn(service, 'findById')
//         .mockRejectedValue(
//           new HttpException('Tag not found', HttpStatus.NOT_FOUND),
//         );

//       await expect(service.delete(userId, tagId)).rejects.toThrowError(
//         new HttpException('Tag not found', HttpStatus.NOT_FOUND),
//       );
//     });
//   });
// });
