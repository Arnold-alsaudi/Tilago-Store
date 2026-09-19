/**
 * تصوير التركيبات آلياً.
 *
 * بيفتح كل تركيبة في متصفح، بيصوّرها بكذا لون، وبيحفظ الصور في
 * public/shots. الصور دي بتتستخدم في كروت المتجر والهيرو، بدل صور
 * جاهزة مش بتاعتنا ومالهاش علاقة بالمنتج.
 *
 * بيشتغل لوحده تماماً: بيقوم سيرفر صغير مؤقت يقدّم الملفات، فمش
 * محتاج سيرفر التطوير شغّال ولا توقيع.
 *
 *   node scripts/shoot-overlays.mjs           كل التركيبات
 *   node scripts/shoot-overlays.mjs team-scores   واحدة بعينها
 */
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join, dirname, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'shots');
const PUBLIC = join(ROOT, 'public');

const CHROME = process.env.CHROME_PATH
  || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

/** الألوان اللي بنصوّر بيها — نفس باليتات صفحة الأوفرلي */
const PALETTES = {
  violet: { violet: '#a855f7', grape: '#5416B5', navy: '#0F083B', deep: '#0C0516' },
};

/** إعدادات العرض لكل تركيبة — نصوص واقعية بدل الافتراضي */
const PRESETS = {
  'starting-soon.html': { title: 'البث هيبدأ قريب', note: 'جهّز نفسك، هنبدأ خلال دقائق' },
  'team-scores.html': { title: 'تحدي الهدايا', t1: 'الصقور', t2: 'الأسود', s1: '14', s2: '9', unit: 'هدية' },
};

const MIME = { '.html': 'text/html; charset=utf-8', '.ttf': 'font/ttf', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// خلفية البث الوهمية — بتتحقن ورا التركيبة وقت التصوير بس
const BACKDROP = process.env.NO_BACKDROP !== '1';
const BACKDROP_JS = `(() => {
  const d = document.createElement('div');
  d.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:-1', 'pointer-events:none',
    'background:' + [
      'radial-gradient(60% 55% at 22% 18%, rgba(168,85,247,.20), transparent 62%)',
      'radial-gradient(45% 45% at 84% 76%, rgba(34,211,238,.13), transparent 60%)',
      'radial-gradient(120% 90% at 50% 120%, rgba(84,22,181,.18), transparent 55%)',
      'linear-gradient(155deg, #140a2c 0%, #0a0518 55%, #070310 100%)',
    ].join(','),
  ].join(';');

  // حبيبات خفيفة — الخلفية الملساء بتبان صناعية
  const g = document.createElement('div');
  g.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:-1', 'pointer-events:none', 'opacity:.05',
    'background-image:radial-gradient(#fff 1px, transparent 1px)',
    'background-size:3px 3px',
  ].join(';');

  document.body.append(d, g);
  return 1;
})()`;

async function main() {
  const { OVERLAY_HTML } = await import(pathToUrl(join(ROOT, 'src', 'generated', 'overlays.ts')))
    .catch(() => ({}))
    .then(m => m.OVERLAY_HTML ? m : loadGenerated());

  const only = process.argv[2];
  const files = Object.keys(OVERLAY_HTML)
    .filter(f => !only || f.startsWith(only));

  if (!files.length) {
    console.error('مفيش تركيبات — شغّل build-overlays الأول');
    process.exit(1);
  }

  await mkdir(OUT, { recursive: true });

  // سيرفر مؤقت: التركيبة على /x.html والباقي من public
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    const name = url.pathname.slice(1);
    if (OVERLAY_HTML[name]) {
      res.writeHead(200, { 'content-type': MIME['.html'] });
      return res.end(OVERLAY_HTML[name]);
    }
    try {
      const buf = await readFile(join(PUBLIC, url.pathname));
      res.writeHead(200, { 'content-type': MIME[extname(url.pathname)] ?? 'application/octet-stream' });
      res.end(buf);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;

  // بروفايل كروم في مجلد مؤقت — مش جوه public عشان مايتلزقش في الريبو
  const profile = join(tmpdir(), 'tilago-shots-chrome');
  const chrome = spawn(CHROME, [
    '--headless=new', '--remote-debugging-port=9222', '--no-first-run',
    '--hide-scrollbars', '--force-device-scale-factor=1',
    `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' });

  const cdp = await connect(9222);

  for (const file of files) {
    const slug = file.replace(/\.html$/, '');
    for (const [pname, vars] of Object.entries(PALETTES)) {
      // demo مقفول: عايزين القيم اللي في PRESETS تثبت في الصورة
      const q = new URLSearchParams({ demo: '0', ...vars, ...(PRESETS[file] ?? {}) });
      const url = `http://127.0.0.1:${port}/${file}?${q}`;

      await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 900, deviceScaleFactor: 1, mobile: false });
      // خلفية التركيبة شفافة — بنحط وراها لون الموقع عشان الصورة تبقى
      // زي ما الكارت هيبان بالظبط
      await cdp.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 12, g: 5, b: 22, a: 1 } });
      await cdp.send('Page.navigate', { url });
      await sleep(2600);

      // خلفية بث وهمية ورا التركيبة — إضاءة غرفة وعمق، عشان الصورة
      // تبان زي لقطة من بث حقيقي مش مربع طاير على خلفية غامقة
      if (BACKDROP) await cdp.send('Runtime.evaluate', { expression: BACKDROP_JS });

      // بنقص على المحتوى نفسه بنسبة 16:9 — من غير كده الصورة بتطلع
      // فيها فراغ كبير لأن مسرح التركيبة أطول من محتواها
      const box = await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const els = [...document.querySelectorAll('#wrap, #panel, #box')];
          if (!els.length) return null;
          const r = els.map(e => e.getBoundingClientRect());
          const x1 = Math.min(...r.map(b => b.left)), y1 = Math.min(...r.map(b => b.top));
          const x2 = Math.max(...r.map(b => b.right)), y2 = Math.max(...r.map(b => b.bottom));
          return JSON.stringify({ x1, y1, x2, y2 });
        })()`,
        returnByValue: true,
      });

      let clip;
      const raw = box.result?.result?.value;
      if (raw) {
        const b = JSON.parse(raw);
        // قص لازق على المحتوى. مابنفرضش نسبة — الكارت في الموقع
        // بيقص بنفسه، وفرض النسبة هنا كان بيسيب فراغ تحت
        // هامش أوسع على الجنب من فوق وتحت: بيوري الخلفية من غير ما
        // يسيب فراغ كبير، والتركيبة تفضل هي البطل في الصورة
        const padX = 130, padY = 62;
        const x = Math.max(0, b.x1 - padX);
        const y = Math.max(0, b.y1 - padY);
        clip = {
          x, y,
          width: Math.min((b.x2 - b.x1) + padX * 2, 1600 - x),
          height: Math.min((b.y2 - b.y1) + padY * 2, 900 - y),
          scale: 1,
        };
      }

      const shot = await cdp.send('Page.captureScreenshot', clip ? { format: 'png', clip } : { format: 'png' });
      const name = pname === 'violet' ? `${slug}.png` : `${slug}-${pname}.png`;
      await writeFile(join(OUT, name), Buffer.from(shot.result.data, 'base64'));
      console.log('  shots/' + name);
    }
  }

  cdp.close();
  chrome.kill();
  server.close();

  console.log(`تم تصوير ${files.length} تركيبة`);
  process.exit(0);
}

/* ── أدوات ──────────────────────────────────────────────── */

function pathToUrl(p) { return 'file:///' + p.replace(/\\/g, '/'); }

/** الوحدة المولّدة TypeScript، فبنقراها كنص ونطلّع منها الكائن */
async function loadGenerated() {
  const src = await readFile(join(ROOT, 'src', 'generated', 'overlays.ts'), 'utf8');
  const start = src.indexOf('{');
  const end = src.lastIndexOf('}');
  return { OVERLAY_HTML: JSON.parse(src.slice(start, end + 1).replace(/,(\s*})/g, '$1')) };
}

async function connect(port) {
  let targets;
  for (let i = 0; i < 60; i++) {
    try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; }
    catch { await sleep(300); }
  }
  if (!targets) throw new Error('كروم مافتحش — ظبّط CHROME_PATH');

  const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  });
  return {
    send: (method, params = {}) => new Promise(r => {
      const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params }));
    }),
    close: () => ws.close(),
  };
}

main().catch(e => { console.error(e); process.exit(1); });
