import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MemCategory } from '@/common';

import { Meme } from '../../../memes/entities/meme.entity';
import { memeAvatarData } from './avatar.meme.data';

@Injectable()
export class AvatarMemeSeedService {
  constructor(
    @InjectRepository(Meme)
    private memeRepository: Repository<Meme>,
  ) {}

  async run() {
    const count = await this.memeRepository.count({
      where: { category: MemCategory.Avatar },
    });

    if (count === 0) {
      await Promise.all(
        memeAvatarData.map(async (meme) => {
          const { image, ...rest } = meme;
          const newMeme = new Meme(rest);
          newMeme.image = image;
          await this.memeRepository.save(newMeme);
        }),
      );
    }
  }
}
