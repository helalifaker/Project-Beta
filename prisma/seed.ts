import { PrismaClient, CurriculumCpiFrequency, UserRole, VersionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const workspace = await prisma.workspaceSetting.upsert({
    where: { id: 'default-workspace' },
    update: {},
    create: {
      id: 'default-workspace',
      name: 'Relocation Program 2028',
      baseCurrency: 'SAR',
      timezone: 'Asia/Riyadh',
      discountRate: 0.09,
      cpiMin: 0.01,
      cpiMax: 0.06,
    },
  });

  const frenchCurriculum = await prisma.curriculumTemplate.create({
    data: {
      workspaceId: workspace.id,
      name: 'French Curriculum',
      slug: 'french-curriculum',
      capacity: 1200,
      launchYear: 2028,
      tuitionBase: 58_000,
      cpiRate: 0.025,
      cpiFrequency: CurriculumCpiFrequency.ANNUAL,
      rampSteps: {
        create: [
          { yearOffset: 0, utilisation: 1.0, sortOrder: 0 },
          { yearOffset: 1, utilisation: 1.0, sortOrder: 1 },
          { yearOffset: 2, utilisation: 1.0, sortOrder: 2 },
        ],
      },
    },
    include: { rampSteps: true },
  });

  const ibCurriculum = await prisma.curriculumTemplate.create({
    data: {
      workspaceId: workspace.id,
      name: 'International Baccalaureate',
      slug: 'international-baccalaureate',
      capacity: 600,
      launchYear: 2028,
      tuitionBase: 92_000,
      cpiRate: 0.03,
      cpiFrequency: CurriculumCpiFrequency.EVERY_2_YEARS,
      rampSteps: {
        create: [
          { yearOffset: 0, utilisation: 0.2, sortOrder: 0 },
          { yearOffset: 1, utilisation: 0.4, sortOrder: 1 },
          { yearOffset: 2, utilisation: 0.6, sortOrder: 2 },
          { yearOffset: 3, utilisation: 0.8, sortOrder: 3 },
          { yearOffset: 4, utilisation: 1.0, sortOrder: 4 },
        ],
      },
    },
    include: { rampSteps: true },
  });

  const admin = await prisma.profile.upsert({
    where: { email: 'faker.helali@example.com' },
    update: {},
    create: {
      externalId: 'auth0|faker-helali',
      email: 'faker.helali@example.com',
      role: UserRole.ADMIN,
    },
  });

  await prisma.version.create({
    data: {
      name: 'Base Case - 2028 Move',
      status: VersionStatus.DRAFT,
      ownerId: admin.id,
      description:
        'Initial planning version populated with curriculum templates for the 2028 relocation.',
      curricula: {
        create: [
          {
            curriculumTemplateId: frenchCurriculum.id,
            customCapacity: 1200,
          },
          {
            curriculumTemplateId: ibCurriculum.id,
            customCapacity: 600,
          },
        ],
      },
    },
  });

  // Seed data created successfully
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('❌ Seed script failed', error);
    await prisma.$disconnect();
    process.exit(1);
  });


