/**
 * بناء التركيبات: من src/overlays (المصدر المقروء) إلى public/overlays (اللي بيتنشر).
 *
 * ليه؟ الملف اللي بيتسلّم للعميل بيوصل لأي حد فاتح البث، والمصدر عندنا
 * فيه تعليقات بتشرح كل قرار تصميم — ودي أغلى حاجة للي عايز ينسخ.
 * فبنشيل التعليقات، بنضغط، وبنغيّر أسامي المتغيّرات.
 *
 * مقصود إن الضغط خفيف: مفيش تشفير تقيل بيفك نفسه وقت التشغيل، لأن
 * التركيبة بتشتغل على جهاز العميل وهو بيبث، وأي معالج بناكله بياخد
 * من ضغط الفيديو.
 *
 *   node scripts/build-overlays.mjs
 */
import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'html-minifier-terser';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src', 'overlays');
const OUT = join(ROOT, 'public', 'overlays');

const OPTIONS = {
  collapseWhitespace: true,
  conservativeCollapse: false,
  removeComments: true,
  removeAttributeQuotes: false, // بنسيبها، الفرق مش مستاهل مخاطرة
  minifyCSS: true,
  minifyJS: {
    compress: { passes: 2, drop_console: true },
    mangle: { toplevel: false }, // الكود كله جوه IIFE أصلاً
    format: { comments: false },
  },
};

const kb = n => (n / 1024).toFixed(1) + 'KB';

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const files = (await readdir(SRC)).filter(f => f.endsWith('.html'));
  if (!files.length) {
    console.error('مفيش تركيبات في src/overlays');
    process.exit(1);
  }

  let before = 0;
  let after = 0;

  for (const file of files) {
    const raw = await readFile(join(SRC, file), 'utf8');
    const out = await minify(raw, OPTIONS);

    // لو الضغط كسر حاجة وطلع ملف فاضي، نوقف بدل ما ننشر حاجة مكسورة
    if (!out || out.length < 200) {
      console.error(`الضغط خرّب ${file} — النتيجة ${out.length} حرف`);
      process.exit(1);
    }

    await writeFile(join(OUT, file), out, 'utf8');
    before += raw.length;
    after += out.length;
    console.log(`  ${file.padEnd(24)} ${kb(raw.length)} → ${kb(out.length)}`);
  }

  const saved = Math.round((1 - after / before) * 100);
  console.log(`تم بناء ${files.length} تركيبة — أصغر بـ${saved}%`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
