import { Test, TestingModule } from '@nestjs/testing';

import { TutorialLinksService } from './tutorial-links.service';

describe('TutorialLinksService', () => {
  let service: TutorialLinksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TutorialLinksService],
    }).compile();

    service = module.get<TutorialLinksService>(TutorialLinksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
