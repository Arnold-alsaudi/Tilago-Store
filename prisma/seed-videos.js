const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const VIDEOS = [
  { title: 'Venom Intro',   description: 'إنترو فينوم احترافي يفتح بثك بدراما سينمائية مذهلة',        imageUrl: '/photo/venom-1.png',       videoUrl: '' },
  { title: 'Anime Stream',  description: 'تصميم أنيمي حصري مناسب لعشاق الأنمي والبث الياباني',        imageUrl: '/photo/anime.png',         videoUrl: '' },
  { title: 'Epic Overlay',  description: 'أوفرلاي ملحمي بتأثيرات بصرية تجعل بثك استثنائياً',          imageUrl: '/photo/venom-2.png',       videoUrl: '' },
  { title: 'Venom Scene',   description: 'مشهد فينوم كامل بجودة سينمائية عالية الدقة',                 imageUrl: '/photo/venom-5.png',       videoUrl: '' },
  { title: 'Alert Pack',    description: 'باكدج اليرتات متكامل بتصميم موحد ومميز لقناتك',             imageUrl: '/photo/alert-3d.png',      videoUrl: '' },
  { title: 'Cyber Intro',   description: 'إنترو سيبراني من المستقبل بتقنيات بصرية متقدمة',             imageUrl: '/photo/venom-7.png',       videoUrl: '' },
  { title: 'Special Alert', description: 'اليرت خاص مميز يجعل كل تنبيه حدثاً لا يُنسى',              imageUrl: '/photo/alert-special.png', videoUrl: '' },
  { title: 'Follow Burst',  description: 'تأثير متابعة احترافي يعطي جمهورك تجربة بصرية رائعة',        imageUrl: '/photo/venom-9.png',       videoUrl: '' },
  { title: 'Galaxy Stream', description: 'تصميم كوني شامل يحوّل بثك إلى تجربة فضائية ساحرة',         imageUrl: '/photo/venom-10.png',      videoUrl: '' },
];

async function main() {
  console.log('Adding video products...');
  for (const v of VIDEOS) {
    const existing = await prisma.product.findFirst({ where: { title: v.title, category: 'VIDEO' } });
    if (existing) { console.log(`  skip: ${v.title} (already exists)`); continue; }
    await prisma.product.create({
      data: { title: v.title, description: v.description, price: 0, category: 'VIDEO', imageUrl: v.imageUrl, videoUrl: v.videoUrl || null, tags: [], active: true, featured: false },
    });
    console.log(`  added: ${v.title}`);
  }
  console.log('Done.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
