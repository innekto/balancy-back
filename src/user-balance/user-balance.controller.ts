import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger/dist';
import { DeepPartial } from 'typeorm';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ApiCustomResponse, User } from '@/common';

import responses from '../responses.json';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { UserBalanceEntity } from './entities/user-balance.entity';
import { UserBalanceService } from './user-balance.service';

@ApiTags('User-balance')
@Controller('user-balance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserBalanceController {
  constructor(private readonly userBalanceService: UserBalanceService) {}

  @Post('create')
  @ApiOperation({
    summary: 'set user balance',
  })
  @ApiCustomResponse(HttpStatus.CREATED, responses.userBalance)
  async createBalance(
    @User('id') userId: number,
    @Body() payload: CreateBalanceDto,
  ): Promise<DeepPartial<UserBalanceEntity>> {
    return this.userBalanceService.createBalance(userId, payload);
  }

  @Patch('update')
  @ApiOperation({
    summary: 'update user balance',
  })
  @ApiCustomResponse(HttpStatus.OK, responses.userBalance)
  async update(
    @User('id') userId: number,
    @Body() payload: UpdateBalanceDto,
  ): Promise<UserBalanceEntity> {
    return await this.userBalanceService.updateBalance(userId, payload);
  }

  @Get()
  @ApiOperation({
    summary: 'get user balance',
  })
  @ApiCustomResponse(HttpStatus.OK, responses.userBalance)
  async get(@User('id') userId: number): Promise<UserBalanceEntity> {
    return await this.userBalanceService.getBalance(userId);
  }
}
