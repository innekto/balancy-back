import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Role, Roles, RolesGuard } from '@/common';

import { CreateMemeDto } from './dto/create-meme.dto';
import { MemesService } from './memes.service';

@Controller('memes')
@ApiTags('Memes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Roles(Role.Admin)
@UseGuards(RolesGuard)
export class MemesController {
  constructor(private readonly memesService: MemesService) {}

  @Post()
  @ApiOperation({ summary: 'add new meme by admin' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imagePath'))
  async create(
    @Body() payload: CreateMemeDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.memesService.create(payload, file);
  }
}
