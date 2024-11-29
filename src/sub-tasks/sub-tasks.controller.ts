import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ApiCustomResponse, User } from '@/common';

import responses from '../responses.json';
import { CreateSubTaskDto } from './dto/create-sub-task.dto';
import { UpdateSubTaskDto } from './dto/update-sub-task.dto';
import { SubTasksService } from './sub-tasks.service';

@Controller('schedule/sub-tasks')
@ApiTags('SubTasks')
@UseGuards(JwtAuthGuard)
export class SubTasksController {
  constructor(private readonly subTasksService: SubTasksService) {}

  @Post(':taskId')
  @ApiBearerAuth('JWT-auth')
  @ApiCustomResponse(HttpStatus.CREATED, responses.createSubTask)
  async createOne(
    @User('id') userId: number,
    @Param('taskId', new ParseIntPipe()) taskId: number,
    @Body() payload: CreateSubTaskDto,
  ) {
    return await this.subTasksService.createOne(userId, taskId, payload);
  }

  @Get(':taskId')
  @ApiBearerAuth('JWT-auth')
  @ApiCustomResponse(HttpStatus.OK, responses.getSubTasks)
  async getAll(
    @User('id') userId: number,
    @Param('taskId', new ParseIntPipe()) taskId: number,
  ) {
    return await this.subTasksService.getAll(userId, taskId);
  }

  @Get(':taskId/:subTaskId')
  @ApiBearerAuth('JWT-auth')
  @ApiCustomResponse(HttpStatus.OK, responses.createSubTask)
  async getOne(
    @User('id') userId: number,
    @Param('taskId', new ParseIntPipe()) taskId: number,
    @Param('subTaskId', new ParseIntPipe()) subTaskId: number,
  ) {
    return await this.subTasksService.getOne(userId, taskId, subTaskId);
  }

  @Patch(':taskId/:subTaskId')
  @ApiBearerAuth('JWT-auth')
  @ApiCustomResponse(HttpStatus.OK, responses.createSubTask)
  async updateOne(
    @User('id') userId: number,
    @Param('taskId', new ParseIntPipe()) taskId: number,
    @Param('subTaskId', new ParseIntPipe()) subTaskId: number,
    @Body() payload: UpdateSubTaskDto,
  ) {
    return await this.subTasksService.updateOne(
      userId,
      taskId,
      subTaskId,
      payload,
    );
  }

  @Delete(':taskId/:subTaskId')
  @ApiBearerAuth('JWT-auth')
  async deleteOne(
    @User('id') userId: number,
    @Param('taskId', new ParseIntPipe()) taskId: number,
    @Param('subTaskId', new ParseIntPipe()) subTaskId: number,
  ) {
    return this.subTasksService.deleteOne(userId, taskId, subTaskId);
  }

  @Patch('complete-incomplete/:taskId/:subTaskId')
  @ApiBearerAuth('JWT-auth')
  @ApiCustomResponse(HttpStatus.OK, responses.createSubTask)
  async toggleStatus(
    @User('id') userId: number,
    @Param('taskId', new ParseIntPipe()) taskId: number,
    @Param('subTaskId', new ParseIntPipe()) subTaskId: number,
  ) {
    return this.subTasksService.toggleStatus(userId, taskId, subTaskId);
  }
}
