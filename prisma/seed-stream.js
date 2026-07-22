const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const packages = [
    {
      title:       'باكدج وطن',
      description: 'Watan Stream Pack',
      price:       0,
      category:    'STREAM',
      imageUrl:    '/photo/venom-1.png',
      images:      ['/photo/venom-1.png', '/photo/venom-2.png', '/photo/venom-3.png', '/photo/venom-4.png'],
      videos:      [],
      videoUrl:    null,
      featured:    true,
      active:      true,
      tags:        ['stream', 'overlay'],
    },
    {
      title:       'باكدج فينوم',
      description: 'Venom Pack',
      price:       0,
      category:    'STREAM',
      imageUrl:    '/photo/venom-cover.png',
      images:      [
        '/photo/venom-1.png', '/photo/venom-2.png', '/photo/venom-3.png',
        '/photo/venom-4.png', '/photo/venom-5.png', '/photo/venom-6.png',
        '/photo/venom-7.png', '/photo/venom-8.png', '/photo/venom-9.png',
        '/photo/venom-10.png', '/photo/venom-11.png', '/photo/venom-12.png',
      ],
      videos:      [],
      videoUrl:    null,
      featured:    true,
      active:      true,
      tags:        ['stream', 'venom'],
    },
    {
      title:       'باكدج شراود',
      description: 'ABN Shroud Pack',
      price:       0,
      category:    'STREAM',
      imageUrl:    '/photo/venom-5.png',
      images:      ['/photo/venom-5.png', '/photo/venom-6.png', '/photo/venom-7.png'],
      videos:      ['/video/shroud-starting-soon.mp4'],
      videoUrl:    '/video/shroud-starting-soon.mp4',
      featured:    false,
      active:      true,
      tags:        ['stream', 'shroud'],
    },
    {
      title:       'باكدج أنمي',
      description: 'Anime Pack',
      price:       0,
      category:    'STREAM',
      imageUrl:    '/photo/anime.png',
      images:      ['/photo/anime.png', '/photo/venom-8.png'],
      videos:      [],
      videoUrl:    null,
      featured:    false,
      active:      true,
      tags:        ['stream', 'anime'],
    },
    {
      title:       'باكدج ثري دي',
      description: '3D Pro Pack',
      price:       0,
      category:    'STREAM',
      imageUrl:    '/photo/venom-9.png',
      images:      ['/photo/venom-9.png', '/photo/venom-10.png'],
      videos:      [],
      videoUrl:    null,
      featured:    false,
      active:      true,
      tags:        ['stream', '3d'],
    },
    {
      title:       'باكدج مينيمال',
      description: 'Minimal Pack',
      price:       0,
      category:    'STREAM',
      imageUrl:    '/photo/venom-3.png',
      images:      ['/photo/venom-11.png', '/photo/venom-12.png'],
      videos:      [],
      videoUrl:    null,
      featured:    false,
      active:      true,
      tags:        ['stream', 'minimal'],
    },
  ];

  for (const pkg of packages) {
    const exists = await prisma.product.findFirst({ where: { title: pkg.title, category: 'STREAM' } });
    if (exists) {
      console.log(`⏭  موجود بالفعل: ${pkg.title}`);
      continue;
    }
    await prisma.product.create({ data: pkg });
    console.log(`✅ تمت الإضافة: ${pkg.title}`);
  }

  console.log('\nتم seed الباكدجات بنجاح!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
