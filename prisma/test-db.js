const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  await p.$connect();
  console.log('✅ DB Connected successfully');

  // Test basic queries
  const userCount = await p.user.count();
  const productCount = await p.product.count();
  const paymentCount = await p.payment.count();

  console.log(`✅ Users: ${userCount}`);
  console.log(`✅ Products: ${productCount}`);
  console.log(`✅ Payments: ${paymentCount}`);

  // Test write (create + delete)
  const test = await p.siteSetting.upsert({
    where: { key: '__test__' },
    update: { value: 'ok' },
    create: { key: '__test__', value: 'ok' },
  });
  await p.siteSetting.delete({ where: { key: '__test__' } });
  console.log('✅ DB Write/Delete: OK');
}

main()
  .catch(e => console.error('❌ DB Error:', e.message))
  .finally(() => p.$disconnect());
