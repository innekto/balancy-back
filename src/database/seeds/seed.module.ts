import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { dataSourceOptionst } from '../data-source';
import { AdminSeedModule } from './admin/admin.seed.module';
import { AvatarMemeSeedModule } from './avtar-meme/avatar.meme.seed.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dataSourceOptionst,
    }),
    AvatarMemeSeedModule,
    AdminSeedModule,
  ],
})
export class SeedModule {}
