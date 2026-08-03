import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Example Seed Logic using `upsert` for idempotency
  /*
  const example = await prisma.exampleEntity.upsert({
    where: { id: 'some-uuid-here' },
    update: {},
    create: {
      name: 'Initial Data',
    },
  });
  console.log(`Created/Updated example with id: ${example.id}`);
  */

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
