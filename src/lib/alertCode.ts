// ── نظام أكواد المنتجات ─────────────────────────────────────
//
// كل اليرت ليه كود مختصر بدل ما نفتكره باسمه:
//
//     480  O  4
//     │    │  └── الترتيب داخل نفس النوع + نفس اللون
//     │    └───── حرف اللون
//     └────────── رقم النوع (القسم الفرعي)
//
// الفايدة: لما يوصل طلب من البوت، الكود بيوصّلك للاليرت على طول عشان تعدّله وتسلّمه.
// والعميل يقدر يدوّر بالكود أو بالاسم — الاتنين شغالين.

/** رقم كل نوع. عايز تغيّر رقم؟ غيّره هنا وبس. */
export const SUB_CODE: Record<string, string> = {
  diamond:  '480', // خاصة
  platinum: '120', // تكبيس
  golden:   '240', // جيفت
  anime:    '360', // أنمي
  snow:     '600', // دعم
  fire:     '720', // ثري دي
};

export interface AlertColor {
  key: string;    // الحرف اللي بيتحط في الكود
  label: string;  // الاسم اللي بيظهر للعميل
  hex: string;    // اللون المعروض في الفلتر
}

/** ألوان الاليرتات — الحرف ده اللي بيتحط في نص الكود. */
export const COLORS: AlertColor[] = [
  { key: 'R', label: 'أحمر',   hex: '#e8402f' },
  { key: 'O', label: 'برتقالي', hex: '#f0830b' },
  { key: 'Y', label: 'أصفر',   hex: '#f5c542' },
  { key: 'G', label: 'أخضر',   hex: '#2ecc71' },
  { key: 'C', label: 'سماوي',  hex: '#4fd6e3' },
  { key: 'B', label: 'أزرق',   hex: '#3b82f6' },
  { key: 'P', label: 'بنفسجي', hex: '#9b59d0' },
  { key: 'K', label: 'وردي',   hex: '#ff6fa5' },
  { key: 'W', label: 'أبيض',   hex: '#e8e4f8' },
  { key: 'D', label: 'أسود',   hex: '#4a4458' },
];

export const colorMeta = (key?: string | null): AlertColor | null =>
  COLORS.find(c => c.key === (key ?? '').toUpperCase()) ?? null;

/** الأقسام الفرعية للاليرتات — الأسماء دي هي اللي بتظهر في الموقع واللوحة (موحّدة). */
export const ALERT_SUBS = [
  { value: 'diamond',  label: 'خاصة',   icon: 'fa-gem',       color: '#5EC8F0' },
  { value: 'golden',   label: 'جيفت',   icon: 'fa-gift',      color: '#F5C542' },
  { value: 'platinum', label: 'تكبيس',  icon: 'fa-bolt',      color: '#C7CBE0' },
  { value: 'anime',    label: 'أنمي',   icon: 'fa-star',      color: '#FF6FA5' },
  { value: 'snow',     label: 'دعم',    icon: 'fa-hand-holding-heart', color: '#8FE3F5' },
  { value: 'fire',     label: 'ثري دي', icon: 'fa-cube',      color: '#FF8A3D' },
];

export const subMeta = (v?: string | null) =>
  ALERT_SUBS.find(s => s.value === v) ??
  { value: v ?? '', label: v ?? '—', icon: 'fa-bell', color: '#9B59D0' };

/** يبني كود من أجزائه: ('diamond','O',4) → '480O4' */
export function buildCode(sub: string | null | undefined, color: string, seq: number): string {
  const prefix = SUB_CODE[sub ?? ''] ?? '';
  return `${prefix}${color.toUpperCase()}${seq}`;
}

const CODE_RE = /^(\d{2,4})([A-Z])(\d{1,3})$/;

/** يفكّ الكود لأجزائه — بيرجع null لو الصيغة غلط */
export function parseCode(code: string): { prefix: string; color: string; seq: number } | null {
  const m = CODE_RE.exec(code.trim().toUpperCase());
  if (!m) return null;
  return { prefix: m[1], color: m[2], seq: Number(m[3]) };
}

/** توحيد شكل الكود قبل الحفظ أو المقارنة: مسافات تتشال والحروف تبقى كابيتال */
export function normalizeCode(code: string | null | undefined): string {
  return (code ?? '').trim().toUpperCase().replace(/\s+/g, '');
}

/** هل النص ده شكله كود؟ نستخدمها في البحث عشان نفرّق بين البحث بالكود والبحث بالاسم */
export function looksLikeCode(q: string): boolean {
  return /^\d{2,4}[A-Za-z]?\d{0,3}$/.test(q.trim());
}

/** الرسالة الافتراضية للمنتج اللي لسه مخلصش */
export const DEFAULT_UNAVAILABLE_LABEL = 'لم يكتمل بعد';
