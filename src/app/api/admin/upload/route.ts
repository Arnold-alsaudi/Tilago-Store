import { NextRequest, NextResponse } from 'next/server';
import { isRequestAdmin } from '@/lib/requireAdmin';
import { cloudinary } from '@/lib/cloudinary';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// الفيديوهات بقت روابط يوتيوب — الرفع هنا للصور بس
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

export async function POST(req: NextRequest) {
  try {
    if (!await isRequestAdmin(req)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file received' }, { status: 400 });

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_MIME.includes(file.type) || !ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 415 });
    }

    // حد الحجم — 50 MB
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // ── Cloudinary (يدوم على serverless) ──────────────────────
    if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'tilago',
        resource_type: 'image',
      });
      return NextResponse.json({ url: result.secure_url });
    }

    // ── Fallback محلي — للتطوير فقط ───────────────────────────
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err: any) {
    console.error('[upload error]', err);
    return NextResponse.json({ error: err?.message ?? 'Upload failed' }, { status: 500 });
  }
}
