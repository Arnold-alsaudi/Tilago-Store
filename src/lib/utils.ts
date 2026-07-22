import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// العملة الأساسية للموقع — الجنيه المصري
export const CURRENCY = 'EGP';

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
