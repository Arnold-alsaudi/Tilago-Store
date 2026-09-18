/**
 * بناء التركيبات: من src/overlays (المصدر المقروء) إلى وحدة كود
 * بيستوردها السيرفر ويسلّمها بنفسه.
 *
 * ليه مش في public؟ لأن أي حاجة في public بتبقى مفتوحة للعالم كله.
 * كده الملفات مالهاش عنوان على الموقع من أصله — مفيش حاجة تتخمّن،
 * والسيرفر هو اللي بيقرر مين ياخد إيه.
 *
 * وبنشيل التعليقات وبنضغط الكود، لأن المصدر عندنا بيشرح كل قرار
 * تصميم — ودي أغلى حاجة للي عايز ينسخ.
 *
 * الضغط خفيف بالقصد: تشفير بيفك نفسه وقت التشغيل بياكل معالج،
 * والمعالج ده نفسه اللي بيضغط فيديو العميل وهو بيبث.
 *
 *   node scripts/build-overlays.mjs
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'html-minifier-terser';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src', 'overlays');
const OUT_DIR = join(ROOT, 'src', 'generated');
const OUT = join(OUT_DIR, 'overlays.ts');

const OPTIONS = {
  collapseWhitespace: true,
  removeComments: true,
  minifyCSS: true,
  minifyJS: {
    compress: { passes: 2, drop_console: true },
    mangle: { toplevel: false }, // الكود كله جوه IIFE أصلاً
    format: { comments: false },
  },
};

const kb = n => (n / 1024).toFixed(1) + 'KB';

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const files = (await readdir(SRC)).filter(f => f.endsWith('.html'));
  if (!files.length) {
    console.error('مفيش تركيبات في src/overlays');
    process.exit(1);
  }

  const entries = [];
  let before = 0;
  let after = 0;

  for (const file of files.sort()) {
    const raw = await readFile(join(SRC, file), 'utf8');
    const out = await minify(raw, OPTIONS);

    // لو الضغط كسر حاجة وطلع ملف فاضي، نوقف بدل ما ننشر حاجة مكسورة
    if (!out || out.length < 200) {
      console.error(`الضغط خرّب ${file} — النتيجة ${(out || '').length} حرف`);
      process.exit(1);
    }
    // علامة الحقن لازم تكون موجودة، وإلا التركيبة هتوصل من غير إعداداتها
    if (!out.includes('</title>')) {
      console.error(`${file} مفيهوش <title> — مكان حقن الإعدادات`);
      process.exit(1);
    }

    entries.push(`  ${JSON.stringify(file)}: ${JSON.stringify(out)},`);
    before += raw.length;
    after += out.length;
    console.log(`  ${file.padEnd(24)} ${kb(raw.length)} → ${kb(out.length)}`);
  }

  const ts =
    '// ⚠️ ملف مولّد — اتعمل بـ scripts/build-overlays.mjs. أي تعديل هنا هيضيع.\n' +
    '// المصدر المقروء في src/overlays/\n\n' +
    'export const OVERLAY_HTML: Record<string, string> = {\n' +
    entries.join('\n') +
    '\n};\n';

  await writeFile(OUT, ts, 'utf8');

  // صور التركيبات المتاحة — بتتولد بـ shoot-overlays وبتتخزّن في الريبو.
  // بنقرا الموجود فعلاً عشان الموقع مايحطش صورة مش موجودة.
  const shots = await readdir(join(ROOT, 'public', 'shots'))
    .then(list => list.filter(f => f.endsWith('.png')).map(f => f.replace(/\.png$/, '')).sort())
    .catch(() => []);
  await writeFile(
    join(OUT_DIR, 'shots.ts'),
    [
      '// ⚠️ ملف مولّد — بيتقرا من public/shots',
      '',
      `export const SHOTS: string[] = ${JSON.stringify(shots)};`,
      '',
    ].join('\n'),
    'utf8',
  );

  const saved = Math.round((1 - after / before) * 100);
  console.log(`تم بناء ${files.length} تركيبة — أصغر بـ${saved}% → src/generated/overlays.ts`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
