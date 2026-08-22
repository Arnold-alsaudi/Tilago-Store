import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/getClientIp';
import { cloudinary } from '@/lib/cloudinary';

// رفع شعار العميل — مسار عام (بدون تسجيل دخول) عشان الزائر يخصّص منتجه.
// محمي: rate limit + صور فقط (بدون SVG) + حد حجم، والملفات في فولدر منفصل.
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimit(ip, 6, 60_000);
  if (!success) return NextResponse.json({ error: 'محاولات كثيرة، انتظر قليلاً' }, { status: 429 });

  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'لا يوجد ملف' }, { status: 400 });

  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: 'صيغة غير مدعومة — الصور فقط (JPG/PNG/WEBP/GIF)' }, { status: 415 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'الملف كبير جداً (الحد 10MB)' }, { status: 413 });
  }

  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: 'الرفع غير متاح حالياً' }, { status: 503 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'tilago/logos',
      resource_type: 'image',
    });
    return NextResponse.json({ url: result.secure_url });
  } catch {
    return NextResponse.json({ error: 'فشل رفع الشعار، حاول تاني' }, { status: 500 });
  }
}
