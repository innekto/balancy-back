const dateIsoMatches = 'Date must be in the format YYYY-MM-DDTHH:mm:ss.sssZ';
const datesMessage =
  'All dates in UTC "2024-05-29T21:00:00.000Z"-"2024-05-30T20:59:59.999Z" one day for Eastern European Time';

const deadlineMessageOne =
  'Subtask deadline cannot be later than the task deadline';
const deadlineMessageTwo = 'Deadline must be after start date.';

export { dateIsoMatches, datesMessage, deadlineMessageOne, deadlineMessageTwo };
