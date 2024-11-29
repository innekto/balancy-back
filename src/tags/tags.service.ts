import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { isUniqueTagName, TutorialLinkField } from '@/common';
import { TutorialLinksService } from '@/tutorial-links/tutorial-links.service';
import { UserEntity } from '@/users/entities/user.entity';

import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagEntity } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(TagEntity)
    private tagRepository: Repository<TagEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private tutorialLinkService: TutorialLinksService,
    private dataSource: DataSource,
  ) {}

  async findAll(userId: number) {
    const tags = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoin('tag.tasks', 'task')
      .select([
        'tag.id AS id',
        'tag.name AS name',
        'COUNT(task.id) AS "taskCount"',
      ])
      .where('tag.userId = :userId', { userId })
      .groupBy('tag.id')
      .orderBy('tag.name', 'ASC')
      .getRawMany();

    return tags;
  }

  async findById(userId: number, id: number) {
    const tag = await this.tagRepository.findOneOrFail({
      where: {
        user: { id: userId },
        id,
      },
      relations: ['tasks'],
    });
    return tag;
  }

  private async exist(userId: number, tagName: string) {
    const tag = await this.tagRepository.findOneBy({
      user: { id: userId },
      name: tagName,
    });
    return tag;
  }

  async create(user: UserEntity, payload: CreateTagDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tagNames = payload.names;
      const tagsCount = await this.tagRepository.count({
        where: { user: { id: user.id } },
      });

      isUniqueTagName(tagNames);

      const existingTags = await this.tagRepository.find({
        where: {
          user: { id: user.id },
          name: In(tagNames),
        },
      });

      if (existingTags.length > 0) {
        const existingNames = existingTags.map((tag) => tag.name);
        throw new ConflictException(`Tags ${existingNames} is exist`);
      }

      const totalTagsCount = await this.tagRepository.count({
        where: { user: { id: user.id } },
      });

      if (totalTagsCount >= 10 || totalTagsCount + tagNames.length > 10) {
        throw new ConflictException('Maximum tag limit reached');
      }

      const newTags = await Promise.all(
        tagNames.map(async (tagName) => {
          const tag = new TagEntity(tagName);
          tag.user = user;
          await this.tagRepository.save(tag);
          return tag;
        }),
      );

      const checkElement = await this.userRepository
        .createQueryBuilder('users')
        .leftJoin('users.tutorialLink', 'tl')
        .select('tl.hasAddedTag AS "hasAddedTag" ')
        .where('tl.userId = :userId', { userId: user.id })
        .getRawOne();

      let message: undefined | string;

      if (tagsCount === 0 && !checkElement.hasAddedTag) {
        const existingUser = await this.userRepository.findOneByOrFail({
          id: user.id,
        });

        const result = await this.tutorialLinkService.update(
          existingUser,
          TutorialLinkField.HasAddedTag,
          queryRunner.manager,
        );

        message = result;
      }
      await queryRunner.commitTransaction();
      const responseTags = newTags.map(({ user, ...tag }) => tag);
      return message ? { tags: responseTags, message } : responseTags;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(userId: number, tagId: number, payload: UpdateTagDto) {
    const tag = await this.findById(userId, tagId);

    tag.name = payload.name;

    this.tagRepository.save(tag);
    return tag;
  }

  async delete(userId: number, id: number) {
    const tag = await this.tagRepository.findOneOrFail({
      where: { user: { id: userId }, id },
    });

    return this.tagRepository.delete(tag);
  }

  async handleTagsForNewTask(tags: Array<string>, userId: number) {
    const existingTags = await this.tagRepository.find({
      where: {
        user: { id: userId },
        name: In(tags),
      },
    });

    if (existingTags.length !== tags.length) {
      throw new NotFoundException('Some tags not found');
    }

    return existingTags;
  }

  async findOneForTasks(tagName: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const tagWithTasks = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.tasks', 'task')
      .where('tag.name = :tagName', { tagName })
      .skip(offset)
      .take(limit)
      .getOneOrFail();

    return {
      data: tagWithTasks.tasks,
      total: tagWithTasks.tasks.length,
      page,
      limit,
    };
  }
}
