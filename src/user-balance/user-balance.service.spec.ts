// import { NotFoundException } from '@nestjs/common';
// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// import { UpdateBalanceDto } from './dto/create-balance.dto';
// import { UserBalanceEntity } from './entities/user-balance.entity';
// import { UserBalanceService } from './user-balance.service';

// const user = {
//   id: 2,
//   name: 'user',
// };

// const updateBalanceDto = (
//   work: number,
//   life: number,
//   learning: number,
// ): UpdateBalanceDto => ({
//   work,
//   life,
//   learning,
// });

// const createBalanceEntity = (
//   overrides?: Partial<UserBalanceEntity>,
// ): UserBalanceEntity => ({
//   work: 25,
//   life: 25,
//   learning: 50,
//   userId: user.id,
//   ...overrides,
// });

// describe('UserBalanceService', () => {
//   let service: UserBalanceService;
//   let userBalanceRepository: Repository<UserBalanceEntity>;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         UserBalanceService,
//         {
//           provide: getRepositoryToken(UserBalanceEntity),
//           useClass: Repository,
//         },
//       ],
//     }).compile();

//     service = module.get<UserBalanceService>(UserBalanceService);
//     userBalanceRepository = module.get<Repository<UserBalanceEntity>>(
//       getRepositoryToken(UserBalanceEntity),
//     );
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
//   describe('updateBalance', () => {
//     it('should update user balance successfully', async () => {
//       const userBalance = createBalanceEntity();
//       const payload = updateBalanceDto(25, 50, 25);
//       const updatetBalance = createBalanceEntity({ ...payload });

//       jest
//         .spyOn(userBalanceRepository, 'findOne')
//         .mockResolvedValue(userBalance);

//       jest
//         .spyOn(userBalanceRepository, 'save')
//         .mockResolvedValue(updatetBalance);

//       await service.updateBalance(user.id, payload);

//       expect(userBalanceRepository.findOne).toHaveBeenCalledWith({
//         where: { userId: user.id },
//       });

//       expect(userBalanceRepository.save).toHaveBeenCalledWith(updatetBalance);
//     });

//     it('should throw NotFoundException if user is not found', async () => {
//       const userId = 1;
//       const payload = updateBalanceDto(25, 50, 25);

//       jest.spyOn(userBalanceRepository, 'findOne').mockResolvedValue(null);

//       await expect(service.updateBalance(userId, payload)).rejects.toThrowError(
//         NotFoundException,
//       );

//       expect(userBalanceRepository.findOne).toHaveBeenCalledWith({
//         where: { userId },
//       });
//     });
//   });
// });
