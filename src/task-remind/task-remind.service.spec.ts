import { Test, TestingModule } from '@nestjs/testing';

import { TaskRemindService } from './task-remind.service';

describe('TaskRemindService', () => {
  let service: TaskRemindService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskRemindService],
    }).compile();

    service = module.get<TaskRemindService>(TaskRemindService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
