import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { User } from '@/common';

import { CreateTaskRemindDto } from './dto/create-task-remind.dto';
import { TaskRemindService } from './task-remind.service';

@Controller('task-remind')
@ApiTags('Reminds')
@UseGuards(JwtAuthGuard)
export class TaskRemindController {
  constructor(private readonly taskRemindService: TaskRemindService) {}

  @Post(':taskId/:offset')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'create task reminder',
    description: "offset - UTC offset from the user's local time",
  })
  async create(
    @User('id') userId: number,
    @Param('taskId', new ParseIntPipe()) taskId: number,
    @Param('offset', new ParseIntPipe()) offset: number,
    @Body() payload: CreateTaskRemindDto,
  ) {
    return this.taskRemindService.create(userId, taskId, payload, offset);
  }

  @Get('/:offset')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'get task reminders with pagination',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 5 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  async getAllReminders(
    @Query('limit', new ParseIntPipe()) limit = 5,
    @Query('page', new ParseIntPipe()) page = 1,
    @User('id') userId: number,
    @Param('offset', new ParseIntPipe()) offset: number,
  ) {
    return await this.taskRemindService.getAllReminders(
      userId,
      offset,
      limit,
      page,
    );
  }

  @ApiBearerAuth('JWT-auth')
  @Patch('read')
  async markRemindsAsRead(@User('id') userId: number) {
    return this.taskRemindService.markRemindersAsRead(userId);
  }

  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  async deleteReminder(@User('id') userId: number, @Param('id') id: number) {
    return this.taskRemindService.deleteOneReminder(id, userId);
  }

  @ApiBearerAuth('JWT-auth')
  @Delete('all')
  async remindDelete(@User('id') userId: number): Promise<void> {
    await this.taskRemindService.deleteReadReminders(userId);
  }
}
