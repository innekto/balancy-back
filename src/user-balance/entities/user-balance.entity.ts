import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from '@/users/entities/user.entity';

import { CreateBalanceDto } from '../dto/create-balance.dto';

@Entity({ name: 'user_balance' })
export class UserBalanceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 50, description: 'Work balance' })
  @Column()
  work: number;

  @ApiProperty({ example: 25, description: 'Life balance' })
  @Column()
  life: number;

  @ApiProperty({ example: 25, description: 'Learning balance' })
  @Column()
  learning: number;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  constructor(payload?: CreateBalanceDto) {
    if (!payload) return;
    this.work = payload.work;
    this.life = payload.life;
    this.learning = payload.learning;
  }
}
