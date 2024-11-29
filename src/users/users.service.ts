import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { instanceToInstance } from 'class-transformer';
import { randomBytes } from 'crypto';
import { cancelJob, scheduleJob } from 'node-schedule';
import { EmailService, MemCategory, verifyCodeValidity } from 'src/common';
import {
  DataSource,
  DeepPartial,
  EntityManager,
  FindOneOptions,
  Repository,
} from 'typeorm';

import { ChangePasswordDto, ResetPasswordDto } from '@/auth/dto';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { publicIdExtract } from '@/common/helpers/pudlic-id.extraction';
import { Meme } from '@/memes/entities/meme.entity';
import { SessionService } from '@/session/session.service';
import { TutorialLinksService } from '@/tutorial-links/tutorial-links.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  private emailVerificationJobIds: string[] = [];

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(Meme)
    private memeRepository: Repository<Meme>,
    private emailService: EmailService,
    private cloudinaryService: CloudinaryService,
    private tutorialLinkService: TutorialLinksService,
    readonly sessionService: SessionService,
    private datasource: DataSource,
  ) {}

  async toggleAutoGenerateSubTasks(userId: number) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    user.isAutoGenerateSubTasks = !user.isAutoGenerateSubTasks;

    await this.usersRepository.save(user);
    return !user.isAutoGenerateSubTasks ? false : true;
  }

  async saveUser(
    user: UserEntity,
    manager: EntityManager,
  ): Promise<UserEntity> {
    return await manager.save(user);
  }

  async findOneByParams(
    params: Record<string, string | number | boolean>,
    relations?: string[],
  ): Promise<UserEntity> {
    const queryOptions: FindOneOptions<UserEntity> = {
      where: params,
      relations: relations,
    };
    const user = await this.usersRepository.findOneOrFail(queryOptions);

    return user;
  }

  async findOneForRefreshToken(email: string) {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user || user.deletedAt) {
      throw new UnauthorizedException('invalid token');
    }
  }

  async me(userId: number): Promise<DeepPartial<UserEntity>> {
    const me = await this.findOneByParams({ id: userId }, ['userBalance']);
    return instanceToInstance(me);
  }

  async create(createUserDto: CreateUserDto): Promise<any> {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;
    try {
      const { password, email } = createUserDto;

      const existingUser = await this.usersRepository.findOne({
        where: { email },
        withDeleted: true,
      });

      if (existingUser) {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }

      const user = new UserEntity(createUserDto);

      user.password = await bcrypt.hash(password, 10);
      user.emailVerificationToken = randomBytes(2).toString('hex');
      user.tutorialLink = await this.tutorialLinkService.create();

      const createdUser = await manager.save(user);

      await queryRunner.commitTransaction();

      await this.emailService.sendEmailVerification(
        createdUser.email,
        createdUser.emailVerificationToken,
      );

      const jobId = this.scheduleEmailVerificationCheck(createdUser.id);
      this.emailVerificationJobIds.push(jobId);

      return {
        user: instanceToInstance(createdUser),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const users = await this.usersRepository.find();
    return instanceToInstance(users);
  }

  async verifyEmail(emailVerificationToken: string) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;

    try {
      const user = await this.usersRepository.findOneBy({
        emailVerificationToken,
      });

      if (!user) {
        throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
      }

      user.emailVerified = true;
      user.emailVerificationToken = null;
      user.isLoggedIn = true;
      user.updatedAt = new Date().toISOString();

      const updatedUser = await this.usersRepository.save(user);

      const session = await this.createSession(updatedUser, manager);

      await queryRunner.commitTransaction();

      return {
        user: await this.usersRepository.findOneByOrFail({
          id: updatedUser.id,
        }),
        session,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOpenedSessionAndDelete(id: number, userId: number) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    return await this.sessionService.deleteAndCreateNew(id, user);
  }

  async createSession(user: any, manager: EntityManager) {
    const session = await this.sessionService.create(user, manager);

    return session;
  }

  async resetPassword(payload: ResetPasswordDto) {
    const { email, isApp } = payload;

    const user = await this.findOneByParams({ email });

    const tokenLength = isApp ? 2 : 20;
    user.passwordResetToken = randomBytes(tokenLength).toString('hex');
    user.updatedAt = new Date().toISOString();

    user.updatedAt = new Date().toISOString();
    const updatedUser = await this.usersRepository.save(user);

    this.emailService.sendPasswordReset(
      updatedUser.email,
      updatedUser.passwordResetToken,
      isApp,
    );

    return true;
  }

  async verifyResetCode(resetCode: string) {
    const user = await this.usersRepository.findOneBy({
      passwordResetToken: resetCode,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    const codeValidityPeriodInMinutes = 120;
    verifyCodeValidity(user.updatedAt, codeValidityPeriodInMinutes);

    user.passwordResetToken = null;
    user.updatedAt = new Date().toISOString();
    await this.usersRepository.save(user);
    return true;
  }

  async setPassword(body: ChangePasswordDto) {
    const { token, password, email } = body;

    if (token && email) {
      throw new ConflictException('Cannot provide both token and email');
    }

    const user = token
      ? await this.usersRepository.findOneBy({
          passwordResetToken: token,
        })
      : await this.usersRepository.findOneBy({ email });

    const message = token ? 'Invalid token' : 'User not found';

    if (!user) {
      throw new UnauthorizedException(message);
    }
    if (token) {
      user.passwordResetToken = null;
    }

    user.password = await bcrypt.hash(password, 10);
    user.updatedAt = new Date().toISOString();
    const updatedUser = await this.usersRepository.save(user);

    this.emailService.sendSetPasswordLetter(updatedUser.email);

    return updatedUser;
  }

  async resendEmailVerification(email: string) {
    const user = await this.findOneByParams({ email });

    if (user.emailVerified) {
      throw new HttpException('Email already verified', HttpStatus.CONFLICT);
    }

    user.emailVerificationToken = randomBytes(2).toString('hex');
    const updatedUser = await this.usersRepository.save(user);

    this.emailService.sendEmailVerification(
      updatedUser.email,
      updatedUser.emailVerificationToken,
    );

    const jobId = `verifyEmail_${updatedUser.id}`;

    if (this.emailVerificationJobIds.includes(jobId)) {
      cancelJob(jobId);
      this.removeJobId(jobId);
    }

    const newJobId = this.scheduleEmailVerificationCheck(updatedUser.id);
    this.emailVerificationJobIds.push(newJobId);

    return instanceToInstance(updatedUser);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOneByOrFail({ id });

    await this.usersRepository.update(user.id, {
      ...updateUserDto,
      updatedAt: new Date().toISOString(),
    });

    return await this.usersRepository.findOneByOrFail({ id });
  }

  async logout(id: number) {
    const user = await this.usersRepository.findOneByOrFail({ id });
    user.isLoggedIn = false;
    user.updatedAt = new Date().toISOString();

    const loggedOutUser = await this.usersRepository.save(user);
    await this.sessionService.closeSession(user.id);

    return instanceToInstance(loggedOutUser);
  }

  async softDelete(id: number): Promise<any> {
    // await this.usersRepository
    //   .createQueryBuilder()
    //   .update('users')
    //   .set({
    //     deletedAt: new Date().toISOString(),
    //     updatedAt: new Date().toISOString(),
    //   })
    //   .where('id = :id', { id })
    //   .execute();

    // temporarily; //
    const result = await this.usersRepository.delete(id);
    return result;
  }

  async restore(id: number): Promise<void> {
    const result = await this.usersRepository.restore(id);

    if (result.affected > 0) {
      await this.usersRepository.update(id, {
        updatedAt: new Date().toISOString(),
      });
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    userId: number,
  ): Promise<object> {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const isRandomAvatar = await this.memeRepository.findOneBy({
      image: user.image,
    });

    if (user.image && !isRandomAvatar) {
      const publicId = publicIdExtract(user.image);
      await this.cloudinaryService.deleteFile(publicId);
    }

    const { secure_url } = await this.cloudinaryService.uploadFile(file);
    if (!secure_url) {
      throw new HttpException(
        'Error uploading image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.usersRepository.update(userId, {
      image: secure_url,
      updatedAt: new Date().toISOString(),
    });

    return { secure_url };
  }

  async findOrCreateFromGoogle({ email, username, picture }) {
    let user = await this.usersRepository.findOneBy({ email });

    const status = await this.getUserStatus(user);

    if (!user) {
      user = await this.usersRepository.save({
        email,
        username,
        image: picture,
        password: null,
        emailVerified: true,
        googleToken: randomBytes(8).toString('hex'),
        createdAt: new Date().toISOString(),
      });
    } else {
      user.googleToken = randomBytes(8).toString('hex');
      user = await this.usersRepository.save(user);
    }

    return { user, status };
  }

  async getUserStatus(user: any): Promise<'new' | 'existing'> {
    const exist = user
      ? await this.usersRepository.findOne({
          where: { id: user.id },
        })
      : null;

    return !exist || !exist.password ? 'new' : 'existing';
  }

  private scheduleEmailVerificationCheck(userId: number): string {
    const twoHoursLater = new Date();

    twoHoursLater.setHours(twoHoursLater.getHours() + 2);

    return scheduleJob(`verifyEmail_${userId}`, twoHoursLater, async () => {
      const user = await this.usersRepository.findOneOrFail({
        where: { id: userId },
      });
      if (user && !user.emailVerified) {
        await this.usersRepository.remove(user);
      }
      cancelJob(`verifyEmail_${userId}`);
      this.removeJobId(`verifyEmail_${userId}`);
    }).name;
  }

  async generateRandomAvatar(userId: number) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });

    const query = this.memeRepository
      .createQueryBuilder('memes')
      .where('memes.category=:memeCategory', {
        memeCategory: MemCategory.Avatar,
      });
    const isRandomAvatar = await this.memeRepository.findOneBy({
      image: user.image,
    });

    if (user.image) {
      if (!isRandomAvatar) {
        const publicId = publicIdExtract(user.image);
        await this.cloudinaryService.deleteFile(publicId);
      }

      query.andWhere('memes.image!=:memeImage', { memeImage: user.image });
    }

    const randomAvatar = await query.limit(1).orderBy('RANDOM()').getOne();

    if (!randomAvatar) {
      throw new NotFoundException('No available avatars found.');
    }
    user.image = randomAvatar.image;

    await this.usersRepository.save(user);

    return { randomAvatarUrl: randomAvatar.image };
  }

  private removeJobId(jobId: string): void {
    this.emailVerificationJobIds = this.emailVerificationJobIds.filter(
      (id) => id !== jobId,
    );
  }
}
