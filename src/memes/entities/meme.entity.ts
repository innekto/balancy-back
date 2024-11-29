import { Column, DeepPartial, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { MemCategory } from '@/common';

import { CreateMemeDto } from '../dto/create-meme.dto';

@Entity({ name: 'memes' })
export class Meme {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: false })
  image: string;

  @Column({ type: 'enum', enum: MemCategory, default: MemCategory.Avatar })
  category: MemCategory;

  constructor(payload?: DeepPartial<CreateMemeDto>) {
    if (!payload) return;
    this.name = payload.name;
    this.category = payload.category;
  }
}
