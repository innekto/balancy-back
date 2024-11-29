import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';

import { TaskEntity } from '@/tasks/entities/task.entity';
import { UserEntity } from '@/users/entities/user.entity';

import { CreateLinkDto } from './dto/create-link.dto';
import { LinkEntity } from './entities/link.entity';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(LinkEntity)
    private readonly linkRepository: Repository<LinkEntity>,
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
  ) {}

  async createLink(
    user: UserEntity,
    payload: CreateLinkDto,
    taskId: number,
  ): Promise<DeepPartial<LinkEntity>> {
    const link = new LinkEntity(payload, taskId);
    link.user = user;

    const { user: existingUser, ...createdLink } =
      await this.linkRepository.save(link);
    return createdLink;
  }

  async createLinkFornewTask(
    user: UserEntity,
    linkPayload: CreateLinkDto,
    manager: EntityManager,
  ) {
    const link = new LinkEntity(linkPayload);
    link.user = user;
    const createdLink = await manager.save(link);
    return createdLink;
  }

  async getAll(userId: number, taskId: number): Promise<LinkEntity[]> {
    const links = await this.linkRepository.find({
      where: { user: { id: userId }, task: { id: taskId } },
    });

    if (!links || links.length === 0) {
      throw new NotFoundException(
        `No links found for user with id ${userId} and task with id ${taskId}`,
      );
    }

    return links;
  }

  async findAll(userId: number): Promise<LinkEntity[]> {
    const links = await this.linkRepository.findBy({ user: { id: userId } });
    if (!links || links.length === 0) {
      throw new NotFoundException(`No links found for user`);
    }
    return links;
  }
}
