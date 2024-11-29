import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { Role } from '@/common';
import { UserEntity } from '@/users/entities/user.entity';

@Injectable()
export class AdminSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async run() {
    const isAdmin = await this.userRepository.exist({
      where: { role: Role.Admin },
    });

    if (!isAdmin) {
      const admin = new UserEntity();
      admin.username = 'admin admin';
      admin.email = 'admin@email.com';
      admin.emailVerified = true;
      admin.role = Role.Admin;
      admin.password = await bcrypt.hash('password', 10);

      await this.userRepository.save(admin);
    }
  }
}
