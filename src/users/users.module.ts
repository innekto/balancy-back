import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from 'src/common';

import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { Meme } from '@/memes/entities/meme.entity';
import { Session } from '@/session/entities/session.entity';
import { SessionService } from '@/session/session.service';
import { TaskEntity } from '@/tasks/entities/task.entity';
import { TutorialLink } from '@/tutorial-links/entities/tutorial-link.entity';
import { TutorialLinksService } from '@/tutorial-links/tutorial-links.service';

import { UserEntity } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      Meme,
      TutorialLink,
      TaskEntity,
      Session,
    ]),
  ],
  controllers: [UsersController],
  providers: [
    SessionService,
    EmailService,
    UsersService,
    CloudinaryService,
    TutorialLinksService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
