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

  // Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      description: 'The Acme Corporation from Looney Tunes',
      status: 'ACTIVE',
    },
  });
  console.log(`Seeded Organization: ${org.name} (${org.id})`);

  // Add Admin to Organization
  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: admin.id,
      },
    },
    update: {
      role: 'ADMIN',
    },
    create: {
      organizationId: org.id,
      userId: admin.id,
      role: 'ADMIN',
    },
  });
  console.log(`Added Admin to Organization ${org.name}`);

  // Seed sample Audit Logs for UI demo
  await prisma.auditLog.createMany({
    data: [
      {
        userId: superAdmin.id,
        action: 'CREATE_USER',
        resourceType: 'users',
        resourceId: admin.id,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 Flowlyx-Seeder',
      },
      {
        userId: admin.id,
        action: 'CREATE_PROJECT',
        resourceType: 'projects',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 Flowlyx-Seeder',
      },
      {
        userId: superAdmin.id,
        action: 'UPDATE_SYSTEM_CONFIG',
        resourceType: 'system-configuration',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 Flowlyx-Seeder',
      },
    ],
  });
  console.log('Seeded sample Audit Logs');

  // Create 5 Users and add them to the Organization
  for (let i = 1; i <= 5; i++) {
    const userEmail = `user${i}@flowlyx.com`;
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {
        role: 'USER',
        status: 'ACTIVE',
        isEmailVerified: true,
        passwordHash,
      },
      create: {
        email: userEmail,
        name: `Acme User ${i}`,
        passwordHash,
        role: 'USER',
        status: 'ACTIVE',
        isEmailVerified: true,
      },
    });

    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: org.id,
          userId: user.id,
        },
      },
      update: {
        role: 'MEMBER',
      },
      create: {
        organizationId: org.id,
        userId: user.id,
        role: 'MEMBER',
      },
    });
    console.log(`Seeded User ${i} and added to Organization ${org.name}`);
  }

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
