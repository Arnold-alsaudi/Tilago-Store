import { NextRequest, NextResponse } from 'next/server';
import { isRequestAdmin } from '@/lib/requireAdmin';
import { cloudinary } from '@/lib/cloudinary';

// توقيع مُوقّع للرفع المباشر من المتصفح لـ Cloudinary.
// ده الطريق الوحيد اللي يشتغل للفيديوهات الكبيرة على Vercel (حد الطلب 4.5MB على السيرفر)،
// الملف بيروح Cloudinary مباشرة والـ secret يفضل على السيرفر بس.
export async function POST(req: NextRequest) {
  if (!(await isRequestAdmin(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!apiSecret || !apiKey || !cloudName) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'tilago';
  // لازم نوقّع نفس الباراميترات اللي هتتبعت مع الرفع (مرتبة أبجدياً يعملها Cloudinary)
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret);

  return NextResponse.json({ timestamp, signature, apiKey, cloudName, folder });
}
