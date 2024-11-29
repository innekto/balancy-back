import { BadRequestException, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as webPush from 'web-push';

dotenv.config();

@Injectable()
export class WebPushService {
  vapidKeys: { publicKey: string; privateKey: string };

  constructor() {
    this.vapidKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
    };

    webPush.setVapidDetails(
      'mailto:balancyua@gmail.com',
      this.vapidKeys.publicKey,
      this.vapidKeys.privateKey,
    );
  }

  getPublicKey() {
    return this.vapidKeys.publicKey;
  }
  async sendNotification(subscription: any, payload: any) {
    try {
      await webPush.sendNotification(subscription, payload);
    } catch (error) {
      console.error('Error sending notification:', error);

      if (error.statusCode === 410) {
        throw new BadRequestException(
          'Push subscription has unsubscribed or expired.',
        );
      } else {
        throw new BadRequestException('Failed to send notification.');
      }
    }
  }
}
