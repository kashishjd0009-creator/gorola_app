import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.order.count();
  const orders = await prisma.order.findMany({
    select: { id: true, userId: true, status: true }
  });
  console.log(`Total orders: ${count}`);
  console.log(JSON.stringify(orders, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
