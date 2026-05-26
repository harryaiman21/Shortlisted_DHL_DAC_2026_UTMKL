import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import * as bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });



async function main() {

  const adminPassword = await bcrypt.hash('admin123', 10);
  const editorPassword = await bcrypt.hash('editor123', 10);
  const reviewerPassword = await bcrypt.hash('reviewer123', 10);
  const rpaPassword = await bcrypt.hash('rpa123', 10);

  const users = [
    {
      name: 'Booz',
      email: 'booz@dhl-kb.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
    {
      name: 'Biggus',
      email: 'biggus@dhl-kb.com',
      passwordHash: editorPassword,
      role: UserRole.EDITOR,
    },
    {
      name: 'Indus',
      email: 'indus@dhl-kb.com',
      passwordHash: reviewerPassword,
      role: UserRole.REVIEWER,
    },
    {
      name: 'RPA Bot',
      email: 'rpa-bot@dhl-kb.com',
      passwordHash: rpaPassword,
      role: UserRole.RPA_BOT,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        passwordHash: user.passwordHash,
      },
      create: user,
    });
  }

  const tags = [
    'Delivery',
    'Warehouse',
    'Customs',
    'Finance',
    'Invoice',
    'Customer Support',
    'SOP',
    'System Error',
    'Training',
  ];

  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });