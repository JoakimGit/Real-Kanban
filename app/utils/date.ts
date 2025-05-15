import { format } from 'date-fns';

export function formatDate(dateTime: number | undefined) {
  if (!dateTime) return null;
  try {
    return format(new Date(dateTime), 'MMM d');
  } catch {
    return 'Invalid date';
  }
}
