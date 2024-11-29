import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { User } from '@/common';

import { CreateReasonDto } from './dto/create-reason.dto';
import { ReasonEntity } from './entities/reason.entity';
import { ReasonsService } from './reasons.service';

@Controller('reasons')
@ApiTags('Reasons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReasonsController {
  constructor(private readonly reasonsService: ReasonsService) {}

  @Post(':taskId')
  create(
    @User('id') userId: number,
    @Param('taskId', new ParseIntPipe()) taskId: number,
    @Body() createReasonDto: CreateReasonDto,
  ): Promise<{ taskId: number; reason: ReasonEntity[] }> {
    return this.reasonsService.create(userId, taskId, createReasonDto);
  }

  @Get(':taskId')
  findAll(
    @User('id') userId: number,
    @Param('taskId', new ParseIntPipe()) taskId: number,
  ): Promise<ReasonEntity[]> {
    return this.reasonsService.findAll(userId, taskId);
  }
}
