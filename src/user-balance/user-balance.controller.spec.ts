// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// import { UpdateBalanceDto } from './dto/create-balance.dto';
// import { UserBalanceEntity } from './entities/user-balance.entity';
// import { UserBalanceController } from './user-balance.controller';
// import { UserBalanceService } from './user-balance.service';

// const user = {
//   id: 1,
//   email: 'test@example.com',
//   role: 'user',
// };

// const updateBalanceDto = (): UpdateBalanceDto => ({
//   work: 50,
//   life: 25,
//   learning: 25,
// });

// const createBalanceEntity = (
//   overrides?: Partial<UserBalanceEntity>,
// ): UserBalanceEntity => ({
//   work: 50,
//   life: 25,
//   learning: 25,
//   userId: user.id,
//   ...overrides,
// });

// describe('UserBalanceController', () => {
//   let controller: UserBalanceController;
//   let service: UserBalanceService;

//   const USER_BALANCE_REPOSITORY_TOKEN = getRepositoryToken(UserBalanceEntity);

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [UserBalanceController],
//       providers: [
//         UserBalanceService,
//         { provide: USER_BALANCE_REPOSITORY_TOKEN, useClass: Repository },
//       ],
//     }).compile();

//     controller = module.get<UserBalanceController>(UserBalanceController);
//     service = module.get<UserBalanceService>(UserBalanceService);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   describe('update', () => {
//     it('should update user balance', async () => {
//       const payload: UpdateBalanceDto = updateBalanceDto();
//       const updatedBalance = createBalanceEntity();

//       const updateBalanceSpy = jest
//         .spyOn(service, 'updateBalance')
//         .mockResolvedValue(updatedBalance);

//       const result = await controller.update(user.id, payload);

//       expect(updateBalanceSpy).toHaveBeenCalledWith(user.id, payload);
//       expect(result).toEqual(updatedBalance);
//     });
//   });
// });
