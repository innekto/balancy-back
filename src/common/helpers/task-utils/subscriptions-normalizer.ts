import { Subscription } from '@/subscription/entities/subscription.entity';

export const subNormalizer = (sub: Subscription[]) => {
  const subscriptions = sub.map((sub) => {
    return {
      endpoint: sub.endpoint,

      expirationTime: sub.expirationTime,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };
  });
  return subscriptions;
};
