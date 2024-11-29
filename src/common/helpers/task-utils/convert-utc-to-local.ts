export const convertToLocalTime = (date: string, offset: number): Date => {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - offset);
  return localDate;
};
