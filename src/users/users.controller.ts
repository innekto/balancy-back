import {
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
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ApiCustomResponse, Role, Roles, RolesGuard, User } from 'src/common';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

import responses from '../responses.json';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'view your own profile',
  })
  @ApiCustomResponse(HttpStatus.OK, {
    ...responses.userRegisterResponse,
    userBalance: responses.userBalance,
  })
  async loadUser(@User() user: UserEntity) {
    return await this.usersService.me(user.id);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'update your own profile',
  })
  @ApiCustomResponse(HttpStatus.OK, responses.userRegisterResponse)
  @ApiBearerAuth('JWT-auth')
  updateMe(@User('id') userId: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'user logout',
  })
  async logout(
    @User('id') userId: number,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.clearCookie('refresh_token');
    return this.usersService.logout(userId);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'delete your own profile',
  })
  softDeleteMe(@User('id') id: number) {
    return this.usersService.softDelete(id);
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file to upload',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCustomResponse(
    HttpStatus.CREATED,
    { imageUrl: 'https://.......' },
    'Link to image',
  )
  @ApiOperation({
    summary: 'update avatar',
  })
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
          new FileTypeValidator({ fileType: /image\// }),
        ],
      }),
    )
    image: Express.Multer.File,
    @User('id') userId: number,
  ) {
    const imageUrl = await this.usersService.uploadImage(image, userId);
    return imageUrl;
  }

  @Get()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'List of users (ONLY ADMIN)' })
  getAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Find user (ONLY ADMIN)' })
  getOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.usersService.findOneByParams({ id });
  }

  @Patch(':id')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Update user (ONLY ADMIN)' })
  updateUser(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Delete user (ONLY ADMIN)' })
  softDelete(@Param('id', new ParseIntPipe()) id: number) {
    return this.usersService.softDelete(id);
  }

  @Post(':id/restore')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Restore user (ONLY ADMIN)' })
  async restore(@Param('id', new ParseIntPipe()) id: number) {
    return this.usersService.restore(id);
  }

  @Post('toggle-auto-generate-sub-tasks')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ description: 'toggle auto generate sub tasks' })
  async toggleAutoGenerateSubTasks(@User('id') userId: number) {
    return this.usersService.toggleAutoGenerateSubTasks(userId);
  }

  @Post('add-avatar-mem')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'set random avatar' })
  @ApiCustomResponse(HttpStatus.CREATED, {
    randomAvatarUrl: 'https://res.cloudina......',
  })
  async generateRandomAvatar(@User('id') userId: number) {
    return this.usersService.generateRandomAvatar(userId);
  }
}
