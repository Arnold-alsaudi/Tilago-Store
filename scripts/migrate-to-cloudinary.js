/**
 * نقل صور public/uploads إلى Cloudinary وتحديث روابط المنتجات في قاعدة البيانات.
 * (الفيديوهات بقت روابط يوتيوب — السكريبت ده للصور بس)
 *
 * الاستخدام:
 *   node scripts/migrate-to-cloudinary.js --dry   (معاينة بدون أي تغيير)
 *   node scripts/migrate-to-cloudinary.js         (التنفيذ الفعلي)
 */
const fs = require('fs');
const path = require('path');

// ── تحميل المتغيرات من .env.local ────────────────────────────
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');

const DRY = process.argv.includes('--dry');
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const prisma = new PrismaClient();
const isLocal = (u) => typeof u === 'string' && u.includes('/uploads/');

async function uploadOne(fileName) {
  const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
  if (!fs.existsSync(filePath)) return { error: 'الملف غير موجود على القرص' };

  const ext = path.extname(fileName).toLowerCase();
  if (!IMAGE_EXT.includes(ext)) {
    return { error: 'ملف فيديو — الفيديوهات بقت روابط يوتيوب، ارفعه هناك بدل كده' };
  }

  const res = await cloudinary.uploader.upload(filePath, {
    folder: 'tilago',
    resource_type: 'image',
    public_id: path.basename(fileName, ext),
    overwrite: false,
  });

  return { url: res.secure_url };
}

(async () => {
  if (!DRY && (!process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET.includes('ضع'))) {
    console.error('❌ CLOUDINARY_API_SECRET غير مضبوط في .env.local');
    process.exit(1);
  }

  const products = await prisma.product.findMany();

  // اجمع كل الملفات المحلية المستخدمة
  const files = new Set();
  for (const p of products) {
    for (const u of [p.imageUrl, p.videoUrl, ...(p.images || []), ...(p.videos || [])]) {
      if (isLocal(u)) files.add(u.split('/uploads/')[1]);
    }
  }

  console.log(`${DRY ? '[معاينة] ' : ''}ملفات هيتم رفعها: ${files.size}\n`);
  if (DRY) {
    for (const f of files) {
      const fp = path.join(process.cwd(), 'public', 'uploads', f);
      const mb = fs.existsSync(fp) ? (fs.statSync(fp).size / 1024 / 1024).toFixed(1) : '?';
      console.log(`  ${f} (${mb} MB)`);
    }
    await prisma.$disconnect();
    return;
  }

  // ارفع كل ملف مرة واحدة
  const map = {};
  const failed = [];
  let i = 0;
  for (const f of files) {
    i++;
    process.stdout.write(`[${i}/${files.size}] ${f} ... `);
    try {
      const r = await uploadOne(f);
      if (r.url) { map[f] = r.url; console.log('✅'); }
      else { failed.push({ f, why: r.error }); console.log('❌ ' + r.error); }
    } catch (e) {
      const why = (e && (e.message || (e.error && e.error.message))) || JSON.stringify(e);
      failed.push({ f, why });
      console.log('❌ ' + why);
    }
  }

  // حدّث المنتجات
  const swap = (u) => (isLocal(u) && map[u.split('/uploads/')[1]]) || u;
  let updated = 0;
  for (const p of products) {
    const next = {
      imageUrl: swap(p.imageUrl),
      videoUrl: p.videoUrl ? swap(p.videoUrl) : p.videoUrl,
      images: (p.images || []).map(swap),
      videos: (p.videos || []).map(swap),
    };
    const changed =
      next.imageUrl !== p.imageUrl ||
      next.videoUrl !== p.videoUrl ||
      JSON.stringify(next.images) !== JSON.stringify(p.images || []) ||
      JSON.stringify(next.videos) !== JSON.stringify(p.videos || []);
    if (changed) {
      await prisma.product.update({ where: { id: p.id }, data: next });
      updated++;
    }
  }

  console.log(`\n─────────────────────────────`);
  console.log(`✅ اترفع: ${Object.keys(map).length} ملف`);
  console.log(`📦 اتحدّث: ${updated} منتج`);
  if (failed.length) {
    console.log(`\n❌ فشل ${failed.length} ملف:`);
    failed.forEach(x => console.log(`   ${x.f} — ${x.why}`));
    console.log('\n(دي محتاجة ضغط أو رفع على يوتيوب/فيميو)');
  }
  await prisma.$disconnect();
})();
