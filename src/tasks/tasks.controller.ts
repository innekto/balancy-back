import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { datesMessage, TaskCategories, User } from 'src/common';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreateTagDto } from '@/tags/dto/create-tag.dto';

import responses from '../responses.json';
import { AddImagesDto } from '../task-images/dto/add-images.dto';
import { DeleteImagesDto } from '../task-images/dto/delete-images-dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';
import { TasksService } from './tasks.service';

@Controller('schedule')
@ApiTags('Tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'create new task' })
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/image\//)) {
          return callback(new BadRequestException('Incorrect format'), false);
        }
        callback(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  async createOne(
    @Request() req: any,
    @Body() payload: CreateTaskDto,
    @Query('offset', new ParseIntPipe()) offset: number,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /image\// }),
        ],
        fileIsRequired: false,
      }),
    )
    images: Express.Multer.File[],
  ) {
    return await this.tasksService.create(req.user, payload, offset, images);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'searching tasks' })
  @ApiQuery({ name: 'title', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 5 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @Get('search')
  searchTasks(
    @User('id') userId: number,
    @Query('title') title: string,
    @Query('limit', new ParseIntPipe()) limit = 5,
    @Query('page', new ParseIntPipe()) page = 1,
  ): Promise<
    | {
        data: TaskEntity[];
        total: number;
        page: number;
        limit: number;
      }
    | { message: string }
  > {
    return this.tasksService.searchTasks(title, userId, limit, page);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'get all tasks' })
  findAll(@User('id') userId: number) {
    return this.tasksService.findAll(userId);
  }

  @Get('with-reasons/period')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'find rescheduled tasks by period (between two dates)',
    description: datesMessage,
  })
  findTaskWithReasons(
    @User('id') userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<TaskEntity[]> {
    return this.tasksService.findTasksWithReasons(userId, startDate, endDate);
  }

  @Get('type/tasks')
  @ApiBearerAuth('JWT-auth')
  async getTasks(@User('id') userId: number) {
    return await this.tasksService.findTasks(userId);
  }

  @Get('type/events')
  @ApiBearerAuth('JWT-auth')
  async getEvents(@User('id') userId) {
    return await this.tasksService.findEvents(userId);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'get one task by id' })
  async getById(
    @User('id') userId: number,
    @Param('id', new ParseIntPipe()) taskId: number,
  ): Promise<TaskEntity> {
    return await this.tasksService.findOne(userId, taskId);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'update one task by id' })
  async update(
    @User('id') userId: number,
    @Param('id') taskId: number,
    @Body() payload: UpdateTaskDto,
  ) {
    return await this.tasksService.update(userId, taskId, payload);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'delete one task by id' })
  async remove(@User('id') userId: number, @Param('id') taskId: number) {
    return await this.tasksService.remove(userId, taskId);
  }

  @Get('tasks/:category')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'return tasks by category' })
  async getTasksOnCategory(
    @User('id') userId: number,
    @Param('category', new ParseIntPipe()) category: TaskCategories,
  ): Promise<TaskEntity[]> {
    return this.tasksService.getTasksOnCategory(userId, category);
  }

  @Patch('toggle-status/:taskId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'mark a task as completed/uncompleted' })
  async toggleTaskStatus(
    @User('id') userId: number,
    @Param('taskId', new ParseIntPipe()) taskId: number,
  ): Promise<TaskEntity> {
    return this.tasksService.toggleTaskStatus(userId, taskId);
  }

  @Get('task-hours-statistic/:offset')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'get all time task statistics; date: start of the day in UTC (2024-09-04T21:00:00.000Z - for Eastern European Time(2024-09-05))',
  })
  async getTaskHoursStatistic(
    @User('id') userId: number,
    @Param('offset', new ParseIntPipe()) offset: number,
    @Query('date') date: string,
  ) {
    return await this.tasksService.getTaskHoursStatistic(userId, date, offset);
  }

  @Get('statistics/completion')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'get all time task statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    content: {
      'application/json': {
        example: responses.allTimeStatistics,
      },
    },
  })
  async getStaTisticOnCopmletion(@User('id') userId: number) {
    return this.tasksService.getStaTisticOnCopmletion(userId);
  }

  @Get('statistics/completion/:category')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'get all time task statistics by category' })
  @ApiResponse({
    status: HttpStatus.OK,
    content: {
      'application/json': {
        example: responses.allTimeStatistics,
      },
    },
  })
  async getStaTisticOnCopmletionByCategories(
    @Param('category', new ParseIntPipe()) category: TaskCategories,
    @User('id') userId: number,
  ) {
    return this.tasksService.getStaTisticOnCopmletionByCategory(
      category,
      userId,
    );
  }

  @Get('statistics/period')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'get tasks statistic by period (between two dates)',
    description: datesMessage,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task statistics',
    content: {
      'application/json': {
        example: responses.periodStatistics,
      },
    },
  })
  async getTasksStatisticsForPeriod(
    @User('id') userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<object> {
    return this.tasksService.getTasksStatisticsForPeriod(
      userId,
      startDate,
      endDate,
    );
  }

  @Get('statistics/chart/period/:offset')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'get tasks chart ststistic by period (between two dates)',
    description: `${datesMessage} + offset in minutes(-180)`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task statistics',
    content: {
      'application/json': {
        example: responses.chartStatisticsByPeriod,
      },
    },
  })
  async getChartCompletetStatisticsForPeriod(
    @User('id') userId: number,
    @Param('offset', new ParseIntPipe()) offset: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.tasksService.getChartCompletetStatisticsForPeriod(
      userId,
      startDate,
      endDate,
      offset,
    );
  }

  @Delete()
  @ApiOperation({ summary: 'delete all tasks (only for testing)' })
  @ApiBearerAuth('JWT-auth')
  async delete(@User('id') userId: number) {
    return await this.tasksService.deleteAll(userId);
  }

  @Patch('add-tags/:taskId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'add existing tasg to existing task' })
  async addTags(
    @User('id') userId: number,
    @Param('taskId', new ParseIntPipe()) taskId: number,
    @Body() payload: CreateTagDto,
  ) {
    return await this.tasksService.addTagsToTask(userId, taskId, payload.names);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'delete task images' })
  @Delete('task-images/:taskId')
  async deleteTaskInmages(
    @User('id') userId: number,
    @Param('taskId', new ParseIntPipe()) taskId: number,
    @Body() imageIds: DeleteImagesDto,
  ) {
    return await this.tasksService.deleteTaskImages(
      userId,
      taskId,
      imageIds.imageIds,
    );
  }

  @Post('add-images/:taskId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'add task images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Array of images to upload',
    type: AddImagesDto,
  })
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/image\//)) {
          return callback(new BadRequestException('Incorrect format'), false);
        }
        callback(null, true);
      },
    }),
  )
  async addImages(
    @User('id') userId: number,
    @Param('taskId', new ParseIntPipe()) taskId: number,

    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /image\// }),
        ],
      }),
    )
    images: Express.Multer.File[],
  ) {
    return await this.tasksService.addImages(userId, taskId, images);
  }
}
