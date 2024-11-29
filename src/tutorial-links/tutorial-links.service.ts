import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { UserEntity } from '@/users/entities/user.entity';

import { TutorialLink } from './entities/tutorial-link.entity';

@Injectable()
export class TutorialLinksService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(TutorialLink)
    private tutorialRepository: Repository<TutorialLink>,
  ) {}
  async create() {
    const newTutorial = new TutorialLink();
    return await this.tutorialRepository.save(newTutorial);
  }

  async findOne(userId: number) {
    return await this.tutorialRepository.findOneByOrFail({
      user: { id: userId },
    });
  }

  async update(user: UserEntity, field: string, manager: EntityManager) {
    const tutorialLink = await this.tutorialRepository.findOneByOrFail({
      user: { id: user.id },
    });

    tutorialLink[field] = true;

    const updatedTutorialLink = await manager.save(tutorialLink);

    const allFieldsTrue = Object.values(updatedTutorialLink)
      .filter((v) => typeof v === 'boolean')
      .every((value) => value === true);

    if (allFieldsTrue) {
      user.points += 100;

      await manager.save(user);

      const message = 'Congratulations! You have earned 100 points.';

      return message;
    }
  }
}
