import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApiCustomResponse, User } from '@/common';
import { UserEntity } from '@/users/entities/user.entity';

import responses from '../responses.json';
import { CreateLinkDto } from './dto/create-link.dto';
import { LinksService } from './links.service';

@ApiTags('Links')
@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post(':taskId')
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: HttpStatus.CREATED,
    content: {
      'application/json': {
        example: responses.createdLink,
      },
    },
  })
  async createLink(
    @User() user: UserEntity,
    @Param('taskId', new ParseIntPipe()) taskId: number,
    @Body() createLinkDto: CreateLinkDto,
  ) {
    return await this.linksService.createLink(user, createLinkDto, taskId);
  }

  @Get(':taskId')
  @ApiBearerAuth('JWT-auth')
  @ApiCustomResponse(HttpStatus.OK, responses.linksList)
  async getLinksByTaskId(
    @User('id') userId: number,
    @Param('taskId', new ParseIntPipe()) taskId: number,
  ) {
    return await this.linksService.getAll(userId, taskId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiCustomResponse(HttpStatus.OK, responses.linksList)
  async getLinksByUserId(@User('id') userId: number) {
    return this.linksService.findAll(userId);
  }
}
