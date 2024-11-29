import { Test, TestingModule } from '@nestjs/testing';

import { TaskRemindController } from './task-remind.controller';
import { TaskRemindService } from './task-remind.service';

describe('TaskRemindController', () => {
  let controller: TaskRemindController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskRemindController],
      providers: [TaskRemindService],
    }).compile();

    controller = module.get<TaskRemindController>(TaskRemindController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
