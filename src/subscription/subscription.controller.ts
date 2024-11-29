import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ApiCustomResponse, User } from '@/common';

import responses from '../responses.json';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionService } from './subscription.service';

@Controller('subscription')
@ApiTags('Subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'create new user subscription' })
  @ApiCustomResponse(HttpStatus.CREATED, responses.createSubscription)
  async create(
    @User('id') userId: number,
    @Body() payload: CreateSubscriptionDto,
  ) {
    return await this.subscriptionService.create(userId, payload);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'get user subscriptions' })
  @ApiCustomResponse(HttpStatus.OK, [responses.createSubscription])
  async findAll(@User('id') userId: number) {
    return this.subscriptionService.findAll(userId);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'get one subscription' })
  @ApiCustomResponse(HttpStatus.OK, responses.createSubscription)
  async findOne(
    @User('id') userId: number,
    @Param('id', new ParseIntPipe()) id: number,
  ) {
    return this.subscriptionService.findOne(userId, id);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'delete one subscription' })
  async remove(
    @User('id') userId: number,
    @Param('id', new ParseIntPipe()) id: number,
  ) {
    return this.subscriptionService.remove(userId, id);
  }
}
