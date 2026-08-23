// مساعد رفع للعميل (من مكوّنات الأدمن).
// - الصور: عبر /api/admin/upload زي ما هي (صغيرة، تشتغل تمام).
// - الفيديو: رفع مباشر لـ Cloudinary بتوقيع مُوقّع — يتخطى حد الطلب 4.5MB على Vercel.

// رفع فيديو مباشرة لـ Cloudinary
export async function uploadVideoDirect(file: File): Promise<string> {
  const sigRes = await fetch('/api/admin/sign-upload', { method: 'POST' });
  const sig = await sigRes.json().catch(() => ({}));
  if (!sig.signature) throw new Error(sig.error || 'تعذّر تجهيز الرفع');

  const fd = new FormData();
  fd.append('file', file);
  fd.append('api_key', sig.apiKey);
  fd.append('timestamp', String(sig.timestamp));
  fd.append('signature', sig.signature);
  fd.append('folder', sig.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`,
    { method: 'POST', body: fd },
  );
  const data = await res.json().catch(() => ({}));
  if (!data.secure_url) throw new Error(data.error?.message || 'فشل رفع الفيديو');
  return data.secure_url as string;
}

// رفع صورة عبر الـ API الحالي
export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!data.url) throw new Error(data.error || 'فشل رفع الصورة');
  return data.url as string;
}

// يختار المسار حسب نوع الملف
export async function uploadMediaFile(file: File): Promise<string> {
  if (file.type.startsWith('video/')) return uploadVideoDirect(file);
  return uploadImage(file);
}
