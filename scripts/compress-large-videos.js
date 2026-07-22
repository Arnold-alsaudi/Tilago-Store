/**
 * ضغط الفيديوهات الأكبر من 100 ميجا لتحت الحد المجاني لـ Cloudinary.
 * الأصل بيتنقل لمجلد backup قبل الضغط (مش بيتمسح).
 *
 * الاستخدام:
 *   node scripts/compress-large-videos.js --dry   (معاينة)
 *   node scripts/compress-large-videos.js         (تنفيذ)
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DRY = process.argv.includes('--dry');
const LIMIT = 100 * 1024 * 1024;       // حد Cloudinary المجاني
const TARGET = 85 * 1024 * 1024;       // نستهدف 85 ميجا (هامش أمان)
const UPLOADS = path.join(process.cwd(), 'public', 'uploads');
const BACKUP = path.join(process.cwd(), 'public', 'uploads-originals');

function duration(file) {
  const out = execFileSync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', file,
  ]).toString().trim();
  return parseFloat(out);
}

(async () => {
  const products = await prisma.product.findMany();
  const refs = new Set();
  for (const p of products) {
    for (const u of [p.imageUrl, p.videoUrl, ...(p.images || []), ...(p.videos || [])]) {
      if (typeof u === 'string' && u.includes('/uploads/')) refs.add(u.split('/uploads/')[1]);
    }
  }

  const big = [];
  for (const f of refs) {
    const fp = path.join(UPLOADS, f);
    if (fs.existsSync(fp) && fs.statSync(fp).size > LIMIT) big.push({ f, size: fs.statSync(fp).size });
  }

  console.log(`فيديوهات محتاجة ضغط: ${big.length}\n`);
  if (big.length === 0) { await prisma.$disconnect(); return; }

  if (DRY) {
    big.forEach(b => console.log(`  ${b.f} — ${(b.size / 1024 / 1024).toFixed(0)} MB`));
    await prisma.$disconnect();
    return;
  }

  if (!fs.existsSync(BACKUP)) fs.mkdirSync(BACKUP, { recursive: true });

  let ok = 0;
  const failed = [];
  for (let i = 0; i < big.length; i++) {
    const { f, size } = big[i];
    const src = path.join(UPLOADS, f);
    const bak = path.join(BACKUP, f);
    const tmp = path.join(UPLOADS, 'tmp_' + f);
    process.stdout.write(`[${i + 1}/${big.length}] ${f} (${(size / 1024 / 1024).toFixed(0)}MB) ... `);

    try {
      const dur = duration(src);
      if (!dur || !isFinite(dur)) throw new Error('تعذر قراءة مدة الفيديو');

      const audioBps = 128000;
      const videoBps = Math.max(300000, Math.floor((TARGET * 8) / dur) - audioBps);

      execFileSync('ffmpeg', [
        '-y', '-i', src,
        '-c:v', 'libx264', '-preset', 'fast',
        '-b:v', String(videoBps),
        '-maxrate', String(Math.floor(videoBps * 1.2)),
        '-bufsize', String(videoBps * 2),
        '-c:a', 'aac', '-b:a', '128k',
        '-movflags', '+faststart',
        tmp,
      ], { stdio: ['ignore', 'ignore', 'ignore'] });

      const newSize = fs.statSync(tmp).size;
      if (newSize >= LIMIT) {
        fs.unlinkSync(tmp);
        throw new Error(`الناتج لسه كبير (${(newSize / 1024 / 1024).toFixed(0)}MB)`);
      }

      fs.renameSync(src, bak);   // احفظ الأصل
      fs.renameSync(tmp, src);   // حط المضغوط مكانه
      console.log(`✅ ${(newSize / 1024 / 1024).toFixed(0)}MB`);
      ok++;
    } catch (e) {
      if (fs.existsSync(tmp)) { try { fs.unlinkSync(tmp); } catch {} }
      failed.push({ f, why: e.message });
      console.log('❌ ' + e.message);
    }
  }

  console.log(`\n─────────────────────────────`);
  console.log(`✅ اتضغط: ${ok} فيديو`);
  console.log(`📁 الأصول محفوظة في: public/uploads-originals`);
  if (failed.length) {
    console.log(`\n❌ فشل ${failed.length}:`);
    failed.forEach(x => console.log(`   ${x.f} — ${x.why}`));
  }
  console.log(`\nالخطوة الجاية: node scripts/migrate-to-cloudinary.js`);
  await prisma.$disconnect();
})();
