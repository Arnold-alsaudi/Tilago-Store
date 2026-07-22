// نقل منتجات الـ Alerts من الكود إلى قاعدة البيانات — يشتغل مرة واحدة
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const V = (n) => `/photo/venom-${n}.png`;

const SUBCATS = {
  diamond:  'الأليرتات الماسية',
  golden:   'الأليرتات الذهبية',
  platinum: 'الأليرتات البلاتينية',
  anime:    'الأليرتات الأنمي',
  snow:     'الأليرتات الثلجية',
  fire:     'الأليرتات ثري دي',
};

const ALERTS = {
  diamond: [
    { slug: 'valhalla',   title: 'VALHALLA',      rating: 5,   ratingCount: 1, priceLabel: '94 ريال',  price: 94,  description: 'الإيرت فل سكرين مع اضافة شعارك الخاص', images: [V(1), V(2)] },
    { slug: 'in-the-sky', title: 'In The Sky',    rating: 5,   ratingCount: 5, priceLabel: '94 ريال',  price: 94,  description: 'الإيرت فل سكرين مع اضافة شعارك الخاص', images: [V(5), V(7)] },
    { slug: 'battlecry',  title: 'BATTLECRY',     rating: 4,   ratingCount: 4, priceLabel: '94 ريال',  price: 94,  description: 'الإيرت فل سكرين مع اضافة شعارك الخاص', images: [V(9), V(10)] },
    { slug: 'dj-mo',      title: 'DJ MO - Mwaki', rating: 5,   ratingCount: 1, priceLabel: '94 ريال',  price: 94,  description: 'الإيرت فل سكرين مع اضافة شعارك الخاص', images: [V(11), V(1)] },
    { slug: 'dont-say',   title: "DON'T SAY",     rating: 4.5, ratingCount: 3, priceLabel: '94 ريال',  price: 94,  description: 'الإيرت فل سكرين مع اضافة شعارك الخاص', images: [V(2), V(5)] },
    { slug: 'this-is-it', title: 'THIS IS IT',    rating: 4.8, ratingCount: 6, priceLabel: '94 ريال',  price: 94,  description: 'الإيرت فل سكرين مع اضافة شعارك الخاص', images: [V(7), V(9)] },
  ],
  golden: [
    { slug: 'gold-1',      title: 'Golden Blaze', rating: 4.8, ratingCount: 12, priceLabel: '120 ريال', price: 120, description: 'إيرت ذهبي بتصميم متألق ومميز',     images: ['/photo/alert-gift.png', V(1)] },
    { slug: 'gold-2',      title: 'Royal Crown',  rating: 5,   ratingCount: 6,  priceLabel: '110 ريال', price: 110, description: 'الإيرت الملكي بألوان ذهبية راقية', images: [V(2), '/photo/alert-gift.png'] },
    { slug: 'gold-3',      title: 'Golden Storm', rating: 4.7, ratingCount: 8,  priceLabel: '115 ريال', price: 115, description: 'إيرت ذهبي بتأثيرات كهربائية',      images: [V(5), V(7)] },
    { slug: 'sunlight',    title: 'Sunlight',     rating: 4.9, ratingCount: 5,  priceLabel: '125 ريال', price: 125, description: 'إيرت ذهبي بتصميم شمسي',            images: [V(9), V(10)] },
    { slug: 'gold-rush',   title: 'Gold Rush',    rating: 4.6, ratingCount: 7,  priceLabel: '110 ريال', price: 110, description: 'إيرت ذهبي بحركة سريعة',            images: [V(11), V(1)] },
    { slug: 'golden-king', title: 'Golden King',  rating: 5,   ratingCount: 4,  priceLabel: '130 ريال', price: 130, description: 'إيرت ذهبي بتصميم ملكي',            images: [V(2), V(5)] },
  ],
  platinum: [
    { slug: 'plat-1', title: 'Platinum Pulse', rating: 4.9, ratingCount: 8, priceLabel: '130 ريال', price: 130, description: 'إيرت بلاتيني بتأثيرات كهربائية', images: ['/photo/alert-follow.png', V(1)] },
    { slug: 'plat-2', title: 'Platinum Glow',  rating: 4.8, ratingCount: 6, priceLabel: '125 ريال', price: 125, description: 'إيرت بلاتيني بلمعان دقيق',       images: [V(2), '/photo/alert-follow.png'] },
    { slug: 'plat-3', title: 'Platinum Nova',  rating: 5,   ratingCount: 3, priceLabel: '140 ريال', price: 140, description: 'إيرت بلاتيني بتأثيرات نجمية',    images: [V(5), V(7)] },
    { slug: 'plat-4', title: 'Platinum Edge',  rating: 4.7, ratingCount: 5, priceLabel: '135 ريال', price: 135, description: 'إيرت بلاتيني بحدود حادة',        images: [V(9), V(10)] },
    { slug: 'plat-5', title: 'Platinum Wave',  rating: 4.6, ratingCount: 4, priceLabel: '120 ريال', price: 120, description: 'إيرت بلاتيني بحركة موجية',       images: [V(11), V(1)] },
    { slug: 'plat-6', title: 'Platinum Star',  rating: 5,   ratingCount: 2, priceLabel: '145 ريال', price: 145, description: 'إيرت بلاتيني بتصميم نجمي',       images: [V(2), V(5)] },
  ],
  anime: [
    { slug: 'anime-1',       title: 'Anime Spark',    rating: 5,   ratingCount: 3, priceLabel: '100 ريال', price: 100, description: 'مخصص لعشاق الأنمي والفن الياباني', images: ['/photo/anime.png', V(1)] },
    { slug: 'ninja-flame',   title: 'Ninja Flame',    rating: 4.8, ratingCount: 5, priceLabel: '105 ريال', price: 105, description: 'إيرت أنمي بتأثيرات نار',           images: [V(2), '/photo/anime.png'] },
    { slug: 'samurai-rise',  title: 'Samurai Rise',   rating: 4.7, ratingCount: 4, priceLabel: '110 ريال', price: 110, description: 'إيرت أنمي بتصميم ساموراي',         images: [V(5), V(7)] },
    { slug: 'dragon-spirit', title: 'Dragon Spirit',  rating: 5,   ratingCount: 2, priceLabel: '115 ريال', price: 115, description: 'إيرت أنمي بتصميم تنين',            images: [V(9), V(10)] },
    { slug: 'hero-journey',  title: "Hero's Journey", rating: 4.6, ratingCount: 3, priceLabel: '100 ريال', price: 100, description: 'إيرت أنمي بقصة بطل',              images: [V(11), '/photo/anime.png'] },
    { slug: 'mystic-aura',   title: 'Mystic Aura',    rating: 4.9, ratingCount: 4, priceLabel: '120 ريال', price: 120, description: 'إيرت أنمي بأورا سحرية',           images: [V(1), V(2)] },
  ],
  snow: [
    { slug: 'snow-1',       title: 'Snow Flare',   rating: 4.7, ratingCount: 5, priceLabel: '105 ريال', price: 105, description: 'إيرت بارد بألوان زرقاء متلألئة', images: ['/photo/alert-special.png', V(5)] },
    { slug: 'frostbite',    title: 'Frostbite',    rating: 4.8, ratingCount: 4, priceLabel: '110 ريال', price: 110, description: 'إيرت ثلجي بتأثيرات برد',         images: [V(7), '/photo/alert-special.png'] },
    { slug: 'winter-storm', title: 'Winter Storm', rating: 4.6, ratingCount: 3, priceLabel: '105 ريال', price: 105, description: 'إيرت ثلجي بحركة عاصفة',          images: [V(9), V(10)] },
    { slug: 'ice-crystal',  title: 'Ice Crystal',  rating: 5,   ratingCount: 2, priceLabel: '115 ريال', price: 115, description: 'إيرت ثلجي بتصميم بلوري',         images: [V(11), V(1)] },
    { slug: 'frozen-night', title: 'Frozen Night', rating: 4.9, ratingCount: 3, priceLabel: '120 ريال', price: 120, description: 'إيرت ثلجي ليلي',                 images: [V(2), V(5)] },
    { slug: 'polar-wind',   title: 'Polar Wind',   rating: 4.5, ratingCount: 4, priceLabel: '100 ريال', price: 100, description: 'إيرت ثلجي برياح قطبية',          images: [V(7), V(9)] },
  ],
  fire: [
    { slug: 'fire-1',       title: 'Inferno Rise',  rating: 4.9, ratingCount: 6, priceLabel: '135 ريال', price: 135, description: 'إيرت ثري دي بتصميم ناري مبهر', images: ['/photo/alert-3d.png', V(1)] },
    { slug: 'blaze-storm',  title: 'Blaze Storm',   rating: 4.8, ratingCount: 4, priceLabel: '130 ريال', price: 130, description: 'إيرت ثري دي بعاصفة نارية',     images: [V(2), '/photo/alert-3d.png'] },
    { slug: 'magma-flow',   title: 'Magma Flow',    rating: 4.7, ratingCount: 3, priceLabel: '125 ريال', price: 125, description: 'إيرت ثري دي بتدفق بركاني',     images: [V(5), V(7)] },
    { slug: 'phoenix-wing', title: 'Phoenix Wing',  rating: 5,   ratingCount: 5, priceLabel: '140 ريال', price: 140, description: 'إيرت ثري دي بجناح العنقاء',    images: [V(9), V(10)] },
    { slug: 'ember-glow',   title: 'Ember Glow',    rating: 4.6, ratingCount: 2, priceLabel: '120 ريال', price: 120, description: 'إيرت ثري دي بتوهج الجمر',      images: [V(11), V(1)] },
    { slug: 'solar-flare',  title: 'Solar Flare',   rating: 4.8, ratingCount: 4, priceLabel: '145 ريال', price: 145, description: 'إيرت ثري دي بانفجار شمسي',     images: [V(2), V(5)] },
  ],
};

async function main() {
  let count = 0;
  for (const [subCat, items] of Object.entries(ALERTS)) {
    for (const item of items) {
      await prisma.product.upsert({
        where: { slug: item.slug },
        update: {},
        create: {
          slug: item.slug,
          title: item.title,
          description: item.description,
          price: item.price,
          priceLabel: item.priceLabel,
          category: 'ALERTS',
          subCategory: subCat,
          imageUrl: item.images[0],
          images: item.images,
          videoUrl: '/video/tilago.mp4',
          rating: item.rating,
          ratingCount: item.ratingCount,
          tags: [SUBCATS[subCat]],
          active: true,
        },
      });
      count++;
    }
  }
  console.log(`✅ Seeded ${count} alert products`);
}

main().finally(() => prisma.$disconnect());
