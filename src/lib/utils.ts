import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// العملة الأساسية للموقع — الجنيه المصري
export const CURRENCY = 'EGP';

export function formatPrice(price: number): string {
  // أرقام لاتينية (u-nu-latn) بدل الهندية — أوضح للقراءة وأنسب لجمهور الجيمنج،
  // ومع ذلك بنحتفظ برمز العملة العربي "ج.م".
  // minimumFractionDigits: 0 عشان السعر الصحيح يطلع "94 ج.م" مش "94.00 ج.م".
  return new Intl.NumberFormat('ar-EG-u-nu-latn', {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

// نسخة ASCII بأرقام لاتينية ورمز عملة نصي (EGP) — للأماكن اللي مابتدعمش الخطوط
// العربية زي PDF المولّد بـ jsPDF (خطه الافتراضي بيطلع الأرقام العربية garbage)
export function formatPriceAscii(price: number): string {
  return new Intl.NumberFormat('en-US', {
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
