import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const passwordHash = await argon2.hash('Admin123');

  // Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@flowlyx.com' },
    update: {
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      isEmailVerified: true,
      passwordHash,
    },
    create: {
      email: 'superadmin@flowlyx.com',
      name: 'Super Admin',
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });
  console.log(`Seeded Super Admin user: ${superAdmin.email} (${superAdmin.id})`);

  // Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@flowlyx.com' },
    update: {
      role: 'ADMIN',
      status: 'ACTIVE',
      isEmailVerified: true,
      passwordHash,
    },
    create: {
      email: 'admin@flowlyx.com',
      name: 'System Admin',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });
  console.log(`Seeded Admin user: ${admin.email} (${admin.id})`);

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
