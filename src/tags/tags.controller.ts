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
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ApiCustomResponse } from '@/common';
import { User } from '@/common/decorators';

import responses from '../responses.json';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagsService } from './tags.service';

@Controller('tags')
@ApiTags('Tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiCustomResponse(HttpStatus.OK, responses.getTags)
  getAll(@User('id') userId: number) {
    return this.tagsService.findAll(userId);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiCustomResponse(HttpStatus.OK, responses.getOrPatchOneTag)
  getById(
    @User('id') userId: number,
    @Param('id', new ParseIntPipe()) tagId: number,
  ) {
    return this.tagsService.findById(userId, tagId);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiCustomResponse(HttpStatus.CREATED, responses.createTag)
  create(@Request() req: any, @Body() newTag: CreateTagDto) {
    return this.tagsService.create(req.user, newTag);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiCustomResponse(HttpStatus.OK, responses.getOrPatchOneTag)
  update(
    @User('id') userId: number,
    @Param('id') tagId: number,
    @Body() tag: UpdateTagDto,
  ) {
    return this.tagsService.update(userId, tagId, tag);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  delete(
    @User('id') userId: number,
    @Param('id', new ParseIntPipe()) tagId: number,
  ) {
    return this.tagsService.delete(userId, tagId);
  }
}
