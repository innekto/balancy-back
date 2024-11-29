import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { publicIdExtract } from '@/common/helpers/pudlic-id.extraction';

import { CreateMemeDto } from './dto/create-meme.dto';
import { UpdateMemeDto } from './dto/update-meme.dto';
import { Meme } from './entities/meme.entity';

@Injectable()
export class MemesService {
  constructor(
    @InjectRepository(Meme)
    private memeRepository: Repository<Meme>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(payload: CreateMemeDto, file: Express.Multer.File) {
    const newMeme = new Meme(payload);
    const { secure_url } = await this.cloudinaryService.uploadFile(file);
    newMeme.image = secure_url;
    return await this.memeRepository.save(newMeme);
  }

  async update(id: number, payload: UpdateMemeDto, file: Express.Multer.File) {
    const meme = await this.memeRepository.findOneByOrFail({ id });
    const { imagePath, ...rest } = payload;

    if (file) {
      const publicId = publicIdExtract(meme.image);
      await this.cloudinaryService.deleteFile(publicId);

      const upload = await this.cloudinaryService.uploadFile(file);

      meme.image = upload.secure_url;
    }

    await this.memeRepository.update(id, rest);
    return await this.memeRepository.findOneByOrFail({ id });
  }

  async remove(id: number) {
    const meme = await this.memeRepository.findOneByOrFail({ id });
    const publicId = publicIdExtract(meme.image);

    await this.cloudinaryService.deleteFile(publicId);
    return await this.memeRepository.delete({ id });
  }
}
