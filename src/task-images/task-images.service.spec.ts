import { Test, TestingModule } from '@nestjs/testing';

import { TaskImagesService } from './task-images.service';

describe('TaskImagesService', () => {
  let service: TaskImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskImagesService],
    }).compile();

    service = module.get<TaskImagesService>(TaskImagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
