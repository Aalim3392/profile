import { format, parseISO } from 'date-fns';

export function formatDate(value, pattern = 'dd MMM yyyy') {
  if (!value) {
    return '-';
  }

  try {
    const date = typeof value === 'string' ? parseISO(value.replace(' ', 'T')) : value;
    return format(date, pattern);
  } catch (_error) {
    return value;
  }
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatMonthLabel(value) {
  if (!value) {
    return '-';
  }

  try {
    return format(parseISO(`${value}-01`), 'MMM yyyy');
  } catch (_error) {
    return value;
  }
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
