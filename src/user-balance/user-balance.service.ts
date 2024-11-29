import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { validateBalanceTotal } from '@/common';
import { UsersService } from '@/users/users.service';

import { CreateBalanceDto } from './dto/create-balance.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { UserBalanceEntity } from './entities/user-balance.entity';

@Injectable()
export class UserBalanceService {
  constructor(
    @InjectRepository(UserBalanceEntity)
    private readonly userBalanceRepository: Repository<UserBalanceEntity>,
    private userService: UsersService,
  ) {}

  async createBalance(
    userId: number,
    payload: CreateBalanceDto,
  ): Promise<DeepPartial<UserBalanceEntity> | object> {
    validateBalanceTotal(payload);

    const existingBalance = await this.userBalanceRepository.exist({
      where: { user: { id: userId } },
    });

    if (existingBalance) {
      throw new ConflictException('You already have a balance');
    }

    const user = await this.userService.findOneByParams({ id: userId });
    const userBalance = new UserBalanceEntity(payload);

    userBalance.user = user;

    const { user: existingUser, ...balance } =
      await this.userBalanceRepository.save(userBalance);

    return balance;
  }

  async updateBalance(
    userId: number,
    payload: UpdateBalanceDto,
  ): Promise<UserBalanceEntity> {
    validateBalanceTotal(payload);

    const userBalance = await this.userBalanceRepository.findOneOrFail({
      where: { user: { id: userId } },
    });
    await this.userBalanceRepository.update(userBalance.id, payload);
    return this.userBalanceRepository.findOneOrFail({
      where: { id: userBalance.id },
    });
  }

  async getBalance(userId: number): Promise<UserBalanceEntity> {
    const balance = await this.userBalanceRepository.findOneByOrFail({
      user: { id: userId },
    });

    return balance;
  }
}
