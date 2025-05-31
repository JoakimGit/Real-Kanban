import { format } from 'date-fns';

export function formatDate(
  dateTime: number | undefined,
  dateFormat: string = 'MMM d',
) {
  if (!dateTime) return null;
  try {
    return format(new Date(dateTime), dateFormat);
  } catch {
    return 'Invalid date';
  }
}
