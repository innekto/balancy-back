import { Injectable } from '@nestjs/common';
import * as schedule from 'node-schedule';

import { WebPushService } from '@/web-push/web-push.service';

@Injectable()
export class TaskSchedulerService {
  constructor(private webPushService: WebPushService) {}

  async taskReminder(date: Date, subscription: object, payload: any) {
    schedule.scheduleJob(date, async () => {
      await this.webPushService.sendNotification(subscription, payload);
    });
  }

  async eventReminder(date: Date, subscription: object, payload: any) {
    schedule.scheduleJob(date, async () => {
      await this.webPushService.sendNotification(subscription, payload);
    });
  }
}
