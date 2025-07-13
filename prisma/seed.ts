import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.note.deleteMany();
  await prisma.testSeries.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.user.deleteMany();

  // Create a user for notes
  const user = await prisma.user.create({
    data: {
      email: 'testuser@example.com',
      password: 'password',
      name: 'Test User',
    },
  });

  // Exams (create individually to get IDs)
  const exam1 = await prisma.exam.create({
    data: { title: 'UPSC Civil Services Exam', imageUrl: 'https://picsum.photos/400/300?random=1' },
  });
  const exam2 = await prisma.exam.create({
    data: { title: 'SSC CGL', imageUrl: 'https://picsum.photos/400/300?random=2' },
  });
  const exam3 = await prisma.exam.create({
    data: { title: 'IBPS PO', imageUrl: 'https://picsum.photos/400/300?random=3' },
  });

  // Test Series (use correct exam IDs)
  await prisma.testSeries.createMany({
    data: [
      { title: 'UPSC Prelims Test Series', imageUrl: 'https://picsum.photos/400/300?random=4', examId: exam1.id },
      { title: 'SSC CGL Mock Tests', imageUrl: 'https://picsum.photos/400/300?random=5', examId: exam2.id },
      { title: 'IBPS PO Practice', imageUrl: 'https://picsum.photos/400/300?random=6', examId: exam3.id },
    ],
  });

  // Notes
  await prisma.note.createMany({
    data: [
      { title: 'Indian Polity Notes', imageUrl: 'https://picsum.photos/400/300?random=7', userId: user.id },
      { title: 'Quantitative Aptitude Shortcuts', imageUrl: 'https://picsum.photos/400/300?random=8', userId: user.id },
      { title: 'IBPS PO Notes', imageUrl: 'https://picsum.photos/400/300?random=9', userId: user.id },
    ],
  });

  // Hero Sections (carousel)
  await prisma.heroSection.createMany({
    data: [
      {
        imageUrl: 'https://picsum.photos/600/220?random=101',
        text: 'Welcome to Pariksha Hub! Prepare for your exams with the best resources.'
      },
      {
        imageUrl: 'https://picsum.photos/600/220?random=102',
        text: 'Join our test series and boost your confidence.'
      },
      {
        imageUrl: 'https://picsum.photos/600/220?random=103',
        text: 'Get expert notes and shortcuts for quick revision.'
      }
    ]
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 