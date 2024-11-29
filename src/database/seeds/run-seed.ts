import { NestFactory } from '@nestjs/core';

import { AdminSeedService } from './admin/admin.seed.service';
import { AvatarMemeSeedService } from './avtar-meme/avatar.meme.seed.service';
import { SeedModule } from './seed.module';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  await app.get(AvatarMemeSeedService).run();
  await app.get(AdminSeedService).run();

  await app.close();
};

void runSeed();
