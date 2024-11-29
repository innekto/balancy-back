import { Test, TestingModule } from '@nestjs/testing';

import { ReasonsController } from './reasons.controller';
import { ReasonsService } from './reasons.service';

describe('ReasonsController', () => {
  let controller: ReasonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReasonsController],
      providers: [ReasonsService],
    }).compile();

    controller = module.get<ReasonsController>(ReasonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
