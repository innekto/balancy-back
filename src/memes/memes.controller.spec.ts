import { Test, TestingModule } from '@nestjs/testing';

import { MemesController } from './memes.controller';
import { MemesService } from './memes.service';

describe('MemesController', () => {
  let controller: MemesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemesController],
      providers: [MemesService],
    }).compile();

    controller = module.get<MemesController>(MemesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
