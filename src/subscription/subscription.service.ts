import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '@/users/entities/user.entity';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(userId: number, payload: CreateSubscriptionDto) {
    const user = await this.userRepository.findOneByOrFail({ id: userId });
    const newSubscription = new Subscription(payload);
    newSubscription.user = user;

    const { user: newUser, ...sub } = await this.subscriptionRepository.save(
      newSubscription,
    );
    return sub;
  }

  async findAll(userId: number) {
    return await this.subscriptionRepository.find({
      where: { user: { id: userId } },
    });
  }

  async findOne(userId: number, id: number) {
    return await this.subscriptionRepository.findOneOrFail({
      where: { user: { id: userId }, id },
    });
  }

  async remove(userId: number, id: number) {
    const sub = await this.subscriptionRepository.findOneOrFail({
      where: { user: { id: userId }, id },
    });

    return await this.subscriptionRepository.delete(sub.id);
  }
}
