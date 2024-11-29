import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { UserEntity } from '@/users/entities/user.entity';

import { Session } from './entities/session.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private datasource: DataSource,
  ) {}

  async create(user: UserEntity, manager: EntityManager) {
    try {
      const newSession = new Session();

      newSession.user = user;

      const savedSession = await manager.save(newSession);

      return savedSession;
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all session`;
  }

  async findOneForJwt(userId: number, sessionId: number) {
    const data = await this.sessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.user', 'user')
      .where('session.id = :sessionId', { sessionId })
      .andWhere('session.userId = :userId', { userId })
      .getOne();

    if (!data) {
      throw new BadRequestException('Session is closed!');
    }

    if (!data || !data.user.isLoggedIn) throw new UnauthorizedException();
  }

  async closeSession(userId: number) {
    const session = await this.sessionRepository
      .createQueryBuilder('session')
      .where('session.userId = :userId', { userId })
      .andWhere('session.deletedAt IS NULL')
      .getOne();

    if (!session) {
      return;
    }

    await this.sessionRepository.remove(session);
  }

  async deleteAndCreateNew(id: number, user: any) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;

    try {
      await this.closeSession(user.id);

      const newSession = await this.create(user, manager);

      await queryRunner.commitTransaction();

      return newSession;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
