import { TransformFnParams } from 'class-transformer/types/interfaces';

import { MaybeType } from '../types/maybe.type';

export const lowerCaseTransformer = (
  params: TransformFnParams,
): MaybeType<string> => params.value?.toLowerCase().trim();

export const lowerCaseArrayTransformer = (
  params: TransformFnParams,
): MaybeType<string[]> => {
  if (!Array.isArray(params.value)) return null;

  return params.value.map((item) => item.trim().toLowerCase());
};
