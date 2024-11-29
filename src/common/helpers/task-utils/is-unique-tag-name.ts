import { ConflictException } from '@nestjs/common';

export const isUniqueTagName = (tags: Array<string>) => {
  if (new Set(tags).size !== tags.length) {
    throw new ConflictException('Tag names must be unique');
  }
};
