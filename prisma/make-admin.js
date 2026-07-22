const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EMAILS = ['mohamed8discord@gmail.com', 'mohammedhany01290@gmail.com'];

async function main() {
  const all = await prisma.user.findMany({ select: { email: true, name: true, role: true } });
  console.log('كل المستخدمين المسجلين:');
  all.forEach(u => console.log(`  - ${u.email} (${u.name ?? 'بدون اسم'}) [${u.role}]`));

  for (const email of EMAILS) {
    const updated = await prisma.user.updateMany({
      where: { email },
      data: { role: 'ADMIN' },
    });
    console.log(updated.count > 0 ? `✅ ${email} أصبح ADMIN` : `⚠️ ${email} غير موجود في قاعدة البيانات`);
  }
}

main().finally(() => prisma.$disconnect());
