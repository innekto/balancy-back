import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaskEntity } from '@/tasks/entities/task.entity';
import { TasksModule } from '@/tasks/tasks.module';
import { UsersModule } from '@/users/users.module';

import { ReasonEntity } from './entities/reason.entity';
import { ReasonsController } from './reasons.controller';
import { ReasonsService } from './reasons.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReasonEntity, TaskEntity]),
    TasksModule,
    UsersModule,
  ],
  controllers: [ReasonsController],
  providers: [ReasonsService],
})
export class ReasonsModule {}
