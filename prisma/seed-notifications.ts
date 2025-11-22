import { prisma } from '../src/lib/prisma'

async function main() {
  // Replace with an existing profile id in your DB for testing
  const testProfileId = process.env.TEST_PROFILE_ID || ''

  const now = new Date()

  const p: any = prisma
  await p.notification.createMany({
    data: [
      {
        profileId: testProfileId || null,
        type: 'SYSTEM',
        title: 'Welcome to CATFY',
        message: 'Thanks for trying Catfy — here are some tips to get started.',
        url: '/dashboard',
        read: false,
        priority: 'MEDIUM',
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24),
      },
      {
        profileId: testProfileId || null,
        type: 'PRODUCT',
        title: 'Product import finished',
        message: 'Your product import completed successfully.',
        url: '/catalogue/new',
        read: false,
        priority: 'MEDIUM',
        createdAt: new Date(now.getTime() - 1000 * 60 * 60),
      },
      {
        profileId: testProfileId || null,
        type: 'COLLAB',
        title: 'Alice commented on your catalogue',
        message: '"Looks great!" — Alice',
        url: '/catalogue/preview',
        read: false,
        priority: 'LOW',
        createdAt: now,
      },
    ],
  })

  console.log('Seeded notifications')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
