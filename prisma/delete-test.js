const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.deleteMany({ where: { title: 'uuuu' } })
  .then(r => { console.log('Deleted:', r.count); })
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
