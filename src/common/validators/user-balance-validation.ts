import { BadRequestException } from '@nestjs/common';

import { CreateBalanceDto } from '@/user-balance/dto/create-balance.dto';
import { UpdateBalanceDto } from '@/user-balance/dto/update-balance.dto';

export const validateBalanceTotal = (
  payload: CreateBalanceDto | UpdateBalanceDto,
): void => {
  const total = payload.learning + payload.life + payload.work;
  if (total !== 100) {
    throw new BadRequestException(
      'The sum of learning, life, and work should be equal to 100',
    );
  }
};
