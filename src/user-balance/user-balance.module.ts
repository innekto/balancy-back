import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@/users/entities/user.entity';
import { UsersModule } from '@/users/users.module';

import { UserBalanceEntity } from './entities/user-balance.entity';
import { UserBalanceController } from './user-balance.controller';
import { UserBalanceService } from './user-balance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserBalanceEntity, UserEntity]),
    UsersModule,
  ],
  controllers: [UserBalanceController],
  providers: [UserBalanceService],
})
export class UserBalanceModule {}
